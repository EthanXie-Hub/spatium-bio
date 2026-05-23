"""Unit tests for spatium_bio.io.

These tests are offline by default. The single network test is opt-in via
``pytest -m network``.
"""

from __future__ import annotations

import numpy as np
import pytest

from spatium_bio.io import (
    compute_ca_distance_matrix,
    extract_chain_ca,
    fetch_pdb,
    parse_structure,
)


def test_distance_matrix_is_symmetric_with_zero_diagonal() -> None:
    coords = np.array(
        [
            [0.0, 0.0, 0.0],
            [1.0, 0.0, 0.0],
            [0.0, 2.0, 0.0],
            [0.0, 0.0, 3.0],
        ]
    )
    d = compute_ca_distance_matrix(coords)

    assert d.shape == (4, 4)
    np.testing.assert_allclose(np.diag(d), 0.0)
    np.testing.assert_allclose(d, d.T)
    np.testing.assert_allclose(d[0, 1], 1.0)
    np.testing.assert_allclose(d[0, 2], 2.0)
    np.testing.assert_allclose(d[0, 3], 3.0)


def test_distance_matrix_rejects_wrong_shape() -> None:
    with pytest.raises(ValueError, match="expected"):
        compute_ca_distance_matrix(np.zeros((3, 4)))


def test_fetch_pdb_validates_id() -> None:
    with pytest.raises(ValueError, match="4-character"):
        fetch_pdb("4HHBB")


@pytest.mark.network
def test_fetch_and_parse_4hhb(tmp_path) -> None:
    path = fetch_pdb("4HHB", cache_dir=tmp_path)
    assert path.exists()
    assert path.stat().st_size > 0

    structure = parse_structure(path)
    sequence, coords, residues = extract_chain_ca(structure, chain_id="A")

    # 4HHB chain A is hemoglobin α, 141 residues.
    assert coords.shape == (141, 3)
    assert len(sequence) == 141
    assert len(residues) == 141
    assert sequence.startswith("V")  # Val-1
