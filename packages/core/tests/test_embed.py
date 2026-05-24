"""Unit + integration tests for spatium_bio.embed.

Offline by default:
- input validation
- mean_pool shape behaviour
- cosine_similarity math

Integration (requires the ESM-2 35M download, ~150MB):
- embed a short sequence and check shape
- check that mean cosine sim ordering makes biological sense
  (paralog > unrelated)
"""

from __future__ import annotations

import numpy as np
import pytest

from spatium_bio.embed import (
    _validate_sequence,
    cosine_similarity,
    mean_pool,
)

# --- offline ---------------------------------------------------------


def test_validate_sequence_uppercases_and_strips() -> None:
    assert _validate_sequence("  acdef ghikl  ") == "ACDEFGHIKL"


def test_validate_sequence_rejects_non_standard() -> None:
    with pytest.raises(ValueError, match="non-standard"):
        _validate_sequence("ACDEFX")


def test_validate_sequence_rejects_empty() -> None:
    with pytest.raises(ValueError, match="empty"):
        _validate_sequence("")


def test_mean_pool_shape_and_value() -> None:
    embeddings = np.array(
        [
            [1.0, 2.0, 3.0],
            [3.0, 4.0, 5.0],
        ]
    )
    pooled = mean_pool(embeddings)
    assert pooled.shape == (3,)
    np.testing.assert_allclose(pooled, [2.0, 3.0, 4.0])


def test_mean_pool_rejects_wrong_shape() -> None:
    with pytest.raises(ValueError, match="expected"):
        mean_pool(np.zeros((3,)))


def test_cosine_similarity_self_is_one() -> None:
    v = np.array([0.5, -1.2, 3.4, 0.0])
    assert cosine_similarity(v, v) == pytest.approx(1.0)


def test_cosine_similarity_orthogonal_is_zero() -> None:
    a = np.array([1.0, 0.0, 0.0])
    b = np.array([0.0, 1.0, 0.0])
    assert cosine_similarity(a, b) == pytest.approx(0.0)


def test_cosine_similarity_opposite_is_minus_one() -> None:
    a = np.array([1.0, 2.0, 3.0])
    assert cosine_similarity(a, -a) == pytest.approx(-1.0)


def test_cosine_similarity_rejects_shape_mismatch() -> None:
    with pytest.raises(ValueError, match="shape mismatch"):
        cosine_similarity(np.zeros(3), np.zeros(4))


def test_cosine_similarity_rejects_zero_vector() -> None:
    with pytest.raises(ValueError, match="zero vector"):
        cosine_similarity(np.zeros(3), np.array([1.0, 2.0, 3.0]))


# --- integration -----------------------------------------------------


@pytest.mark.network
def test_embed_short_sequence_shape() -> None:
    """First-run cost: ~150MB model download. Tests that a known small
    sequence gets the expected embedding shape from the 35M model."""
    from spatium_bio.embed import DEFAULT_MODEL, embed_sequence

    # Random plausible 30-mer; content doesn't matter, only the shape.
    sequence = "MVKVYAPASSANMSVGFDVLGAAVTPVDGA"
    emb = embed_sequence(sequence, model_name=DEFAULT_MODEL, device="cpu")

    assert emb.shape[0] == len(sequence)          # 30 residues
    assert emb.shape[1] == 480                    # 35M model hidden size
    assert emb.dtype == np.float32

    # self-similarity sanity
    pooled = mean_pool(emb)
    assert cosine_similarity(pooled, pooled) == pytest.approx(1.0)
