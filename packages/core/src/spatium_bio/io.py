"""PDB I/O — fetch, parse, and extract Cα coordinates.

Only the protein-data-bank pipeline is here. Embedding and manifold
code will live in sibling modules once they exist.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import requests
from Bio.PDB import PDBParser
from Bio.PDB.Polypeptide import PPBuilder
from Bio.PDB.Structure import Structure

RCSB_PDB_URL = "https://files.rcsb.org/download/{pdb_id}.pdb"


def fetch_pdb(
    pdb_id: str,
    cache_dir: str | Path = ".cache/pdb",
    timeout: float = 30.0,
) -> Path:
    """Download a PDB file from RCSB into ``cache_dir`` and return its path.

    Caching is content-blind: if the file already exists it is reused. Delete
    it manually to force a refetch.
    """
    pdb_id = pdb_id.upper()
    if len(pdb_id) != 4 or not pdb_id.isalnum():
        raise ValueError(f"expected a 4-character PDB ID, got {pdb_id!r}")

    cache = Path(cache_dir)
    cache.mkdir(parents=True, exist_ok=True)
    target = cache / f"{pdb_id}.pdb"
    if target.exists() and target.stat().st_size > 0:
        return target

    url = RCSB_PDB_URL.format(pdb_id=pdb_id)
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    target.write_bytes(response.content)
    return target


def parse_structure(path: str | Path) -> Structure:
    """Parse a PDB file into a Biopython ``Structure``."""
    parser = PDBParser(QUIET=True)
    return parser.get_structure(Path(path).stem, str(path))


def extract_chain_ca(
    structure: Structure,
    chain_id: str = "A",
    model_index: int = 0,
) -> tuple[str, np.ndarray, list[tuple[str, int]]]:
    """Extract the Cα backbone of a single chain.

    Returns ``(sequence, coords, residues)`` where ``sequence`` is the
    one-letter amino-acid string (standard residues only), ``coords`` is a
    ``(N, 3)`` array of Cα xyz, and ``residues`` is a list of
    ``(three_letter, seq_id)`` for the same residues.
    """
    if model_index >= len(structure):
        raise IndexError(f"structure has {len(structure)} model(s)")
    model = structure[model_index]
    if chain_id not in model:
        available = sorted(chain.id for chain in model)
        raise KeyError(f"chain {chain_id!r} not in {available}")
    chain = model[chain_id]

    ppb = PPBuilder()
    one_letter_chunks: list[str] = []
    for polypeptide in ppb.build_peptides(chain):
        one_letter_chunks.append(str(polypeptide.get_sequence()))
    sequence = "".join(one_letter_chunks)

    coords: list[list[float]] = []
    residues: list[tuple[str, int]] = []
    for residue in chain:
        # Skip hetero atoms and waters; the leading hetfield is " " for
        # standard residues.
        if residue.id[0] != " ":
            continue
        if "CA" not in residue:
            continue
        ca = residue["CA"]
        coords.append(list(ca.get_coord()))
        residues.append((residue.get_resname(), int(residue.id[1])))

    if not coords:
        raise ValueError(f"no Cα atoms found in chain {chain_id!r}")

    return sequence, np.asarray(coords, dtype=np.float64), residues


def compute_ca_distance_matrix(coords: np.ndarray) -> np.ndarray:
    """Return the pairwise Euclidean distance matrix for ``coords``.

    Input must be ``(N, 3)``. Output is ``(N, N)``, symmetric, with zeros on
    the diagonal.
    """
    coords = np.asarray(coords, dtype=np.float64)
    if coords.ndim != 2 or coords.shape[1] != 3:
        raise ValueError(f"expected (N, 3) coords, got shape {coords.shape}")
    diff = coords[:, None, :] - coords[None, :, :]
    return np.linalg.norm(diff, axis=-1)
