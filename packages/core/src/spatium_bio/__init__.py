"""Spatium Bio — core library.

Today this package handles:

- protein I/O — fetch from RCSB, parse PDB, extract Cα coordinates
- embeddings — per-residue ESM-2 embeddings + cosine similarity helpers

Manifold and readout operators land here once they exist.
"""

from spatium_bio.embed import (
    DEFAULT_MODEL,
    EncoderHandle,
    cosine_similarity,
    embed_sequence,
    load_encoder,
    mean_pool,
)
from spatium_bio.io import (
    compute_ca_distance_matrix,
    extract_chain_ca,
    fetch_pdb,
    parse_structure,
)

__all__ = [
    "DEFAULT_MODEL",
    "EncoderHandle",
    "compute_ca_distance_matrix",
    "cosine_similarity",
    "embed_sequence",
    "extract_chain_ca",
    "fetch_pdb",
    "load_encoder",
    "mean_pool",
    "parse_structure",
]

__version__ = "0.1.0"
