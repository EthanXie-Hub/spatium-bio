"""Protein sequence embeddings via ESM-2.

A thin wrapper over HuggingFace transformers' ESM-2. Returns per-residue
embeddings as a (L, D) numpy array. Provides mean-pooling and cosine
similarity helpers for the simplest "compare two proteins" workflow.

The model is loaded lazily and cached for the lifetime of the process,
so repeated calls share the same weights.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

import numpy as np

# Default to the smallest practical ESM-2: 35M params, ~150MB download,
# 480-dim embeddings, fast on a CPU laptop. Upgrade to 650M (1280-dim)
# once the rest of the pipeline is in place.
DEFAULT_MODEL = "facebook/esm2_t12_35M_UR50D"

# Standard 20 amino acids — used to validate input sequences early
# rather than letting the tokenizer silently substitute "X" for junk.
VALID_AMINO_ACIDS = set("ACDEFGHIKLMNPQRSTVWY")


@dataclass(frozen=True)
class EncoderHandle:
    """A loaded ESM-2 model + tokenizer + the device they live on."""

    model_name: str
    device: str

    def __repr__(self) -> str:  # avoid printing the model object itself
        return f"EncoderHandle(model_name={self.model_name!r}, device={self.device!r})"


def _resolve_device(device: str | None) -> str:
    """Pick the best available device unless one is explicitly requested."""
    if device is not None:
        return device

    import torch

    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


@lru_cache(maxsize=2)
def _load(model_name: str, device: str):
    """Load (model, tokenizer). Cached so repeated calls reuse weights."""
    import torch
    from transformers import AutoModel, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)
    model.eval()
    model.to(device)
    # Disable gradients globally for this model — we never train it here.
    for p in model.parameters():
        p.requires_grad_(False)

    # Keep CPU threading conservative on laptops: nicer to other work
    # and prevents oversubscription when running multiple sequences.
    if device == "cpu":
        torch.set_num_threads(min(4, torch.get_num_threads()))

    return model, tokenizer


def load_encoder(
    model_name: str = DEFAULT_MODEL,
    device: str | None = None,
) -> EncoderHandle:
    """Pre-load the encoder (optional). Subsequent ``embed_sequence`` calls
    with the same ``model_name`` reuse the cached weights."""
    resolved = _resolve_device(device)
    _load(model_name, resolved)
    return EncoderHandle(model_name=model_name, device=resolved)


def _validate_sequence(sequence: str) -> str:
    """Uppercase, strip whitespace, and reject sequences with non-standard
    amino acids. ESM-2's tokenizer will accept anything, so we have to
    catch it ourselves to keep results honest."""
    s = "".join(sequence.split()).upper()
    if not s:
        raise ValueError("sequence is empty")
    bad = sorted(set(s) - VALID_AMINO_ACIDS)
    if bad:
        raise ValueError(
            f"sequence contains non-standard residues {bad!r}; "
            "expected only the 20 standard amino acids"
        )
    return s


def embed_sequence(
    sequence: str,
    model_name: str = DEFAULT_MODEL,
    device: str | None = None,
) -> np.ndarray:
    """Return ESM-2 per-residue embeddings for ``sequence``.

    Output shape is ``(L, D)`` where ``L`` is the number of residues and
    ``D`` is the model's hidden size (480 for the default 35M model,
    1,280 for the 650M model). Special start/end tokens are stripped.
    """
    import torch

    s = _validate_sequence(sequence)
    resolved = _resolve_device(device)
    model, tokenizer = _load(model_name, resolved)

    encoded = tokenizer(s, return_tensors="pt", add_special_tokens=True)
    encoded = {k: v.to(resolved) for k, v in encoded.items()}

    with torch.inference_mode():
        outputs = model(**encoded)
    hidden = outputs.last_hidden_state[0]  # (1 + L + 1, D)

    # Drop the leading <cls> and trailing <eos> tokens.
    per_residue = hidden[1 : 1 + len(s)]
    return per_residue.detach().to("cpu").float().numpy()


def mean_pool(embeddings: np.ndarray) -> np.ndarray:
    """Collapse a ``(L, D)`` per-residue embedding to a single ``(D,)``
    sequence-level vector by averaging along the residue axis."""
    embeddings = np.asarray(embeddings)
    if embeddings.ndim != 2:
        raise ValueError(f"expected (L, D) embeddings, got shape {embeddings.shape}")
    return embeddings.mean(axis=0)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two 1-D vectors. Returns a Python float
    in [-1, 1]; the embedding-space cosine for ESM-2 is empirically in
    a much narrower band than that, but we don't pretend to normalise."""
    a = np.asarray(a, dtype=np.float64).ravel()
    b = np.asarray(b, dtype=np.float64).ravel()
    if a.shape != b.shape:
        raise ValueError(f"shape mismatch: {a.shape} vs {b.shape}")
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        raise ValueError("cannot compute cosine similarity for a zero vector")
    return float(np.dot(a, b) / denom)
