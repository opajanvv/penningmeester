#!/usr/bin/env python3
"""
Script voor reversibele anonimisering van CSV-bestanden.

Gebruik:
    # Anonimiseren
    python anonymize_csv.py anonymize input.csv output.csv --config config.json

    # Terugdraaien
    python anonymize_csv.py deanonymize anonymized.csv restored.csv --mapping mapping.json
"""

import argparse
import csv
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional


def detect_delimiter(file_path: str) -> str:
    """Detecteer het scheidingsteken van een CSV-bestand."""
    with open(file_path, "r", encoding="utf-8", newline="") as f:
        sample = f.read(1024)
        f.seek(0)
        sniffer = csv.Sniffer()
        try:
            delimiter = sniffer.sniff(sample).delimiter
        except csv.Error:
            # Fallback: probeer eerst puntkomma, dan komma
            if ';' in sample.split('\n')[0]:
                delimiter = ';'
            else:
                delimiter = ','
        return delimiter


class CSVAnonymizer:
    """Reversibele anonimisering van CSV-bestanden met mapping-bestand."""

    def __init__(self, mapping_path: str):
        """
        Args:
            mapping_path: Pad naar JSON-bestand waar mapping wordt opgeslagen/gelezen
        """
        self.mapping_path = Path(mapping_path)
        if self.mapping_path.exists():
            with open(self.mapping_path, "r", encoding="utf-8") as f:
                self.mapping = json.load(f)
        else:
            self.mapping = {}

    def _get_anonymized_value(
        self, column: str, original_value: str, strategy: str = "code"
    ) -> str:
        """
        Genereer of haal geanonimiseerde waarde op.

        Args:
            column: Kolomnaam
            original_value: Originele waarde
            strategy: Strategie ('code', 'remove', of 'hash')

        Returns:
            Geanonimiseerde waarde
        """
        # Unieke key voor deze kolom+waarde combinatie
        key = f"{column}::{original_value}"

        # Als we deze al hebben gemapped, gebruik die
        if key in self.mapping:
            return self.mapping[key]["anonymized"]

        # Genereer nieuwe geanonimiseerde waarde op basis van strategie
        if strategy == "remove":
            anonymized = ""
        elif strategy == "code":
            # Eenvoudige code: KOLOM_001, KOLOM_002, etc.
            count = sum(1 for k in self.mapping.keys() if k.startswith(f"{column}::"))
            anonymized = f"{column.upper()}_{count + 1:03d}"
        elif strategy == "hash":
            # Korte hash (eerste 8 karakters van hash)
            import hashlib

            anonymized = hashlib.sha256(original_value.encode()).hexdigest()[:8]
        else:
            anonymized = f"ANON_{len(self.mapping) + 1}"

        # Bewaar mapping
        self.mapping[key] = {
            "column": column,
            "original": original_value,
            "anonymized": anonymized,
            "strategy": strategy,
        }

        return anonymized

    def anonymize(
        self,
        input_csv: str,
        output_csv: str,
        config: Dict,
        remove_columns: Optional[List[str]] = None,
    ):
        """
        Anonimiseer een CSV-bestand.

        Args:
            input_csv: Pad naar input CSV
            output_csv: Pad naar output CSV
            config: Configuratie dict met 'columns' (kolom -> strategie) en optioneel 'remove' (lijst)
            remove_columns: Lijst van kolommen die volledig verwijderd moeten worden (override config)
        """
        # Haal kolom configuratie uit config dict
        column_config = config.get("columns", config)  # Fallback voor oude stijl config
        remove_columns = remove_columns or config.get("remove", [])

        # Detecteer scheidingsteken
        delimiter = detect_delimiter(input_csv)

        with open(input_csv, "r", encoding="utf-8", newline="") as fin, open(
            output_csv, "w", encoding="utf-8", newline=""
        ) as fout:
            reader = csv.DictReader(fin, delimiter=delimiter)
            fieldnames = [f for f in reader.fieldnames if f not in remove_columns]
            writer = csv.DictWriter(fout, fieldnames=fieldnames, delimiter=delimiter)
            writer.writeheader()

            for row in reader:
                new_row = {}
                for field in fieldnames:
                    original_value = row.get(field, "")

                    # Als deze kolom geanonimiseerd moet worden
                    if field in column_config:
                        strategy = column_config[field]
                        if original_value.strip():  # Alleen anonimiseren als er een waarde is
                            new_row[field] = self._get_anonymized_value(
                                field, original_value, strategy
                            )
                        else:
                            new_row[field] = original_value
                    else:
                        # Kolom ongewijzigd behouden
                        new_row[field] = original_value

                writer.writerow(new_row)

        # Bewaar mapping
        self._save_mapping()

        print(f"✓ Geanonimiseerd: {input_csv} → {output_csv}")
        print(f"✓ Mapping opgeslagen: {self.mapping_path}")

    def deanonymize(self, anonymized_csv: str, output_csv: str):
        """
        Draai anonimisering terug.

        Args:
            anonymized_csv: Pad naar geanonimiseerde CSV
            output_csv: Pad naar output CSV met originele waarden
        """
        # Bouw reverse mapping: anonymized -> original
        reverse_mapping = {}
        for key, value in self.mapping.items():
            column = value["column"]
            anonymized = value["anonymized"]
            original = value["original"]
            if column not in reverse_mapping:
                reverse_mapping[column] = {}
            reverse_mapping[column][anonymized] = original

        # Detecteer scheidingsteken
        delimiter = detect_delimiter(anonymized_csv)

        with open(anonymized_csv, "r", encoding="utf-8", newline="") as fin, open(
            output_csv, "w", encoding="utf-8", newline=""
        ) as fout:
            reader = csv.DictReader(fin, delimiter=delimiter)
            writer = csv.DictWriter(fout, fieldnames=reader.fieldnames, delimiter=delimiter)
            writer.writeheader()

            for row in reader:
                new_row = {}
                for field, value in row.items():
                    # Probeer terug te draaien als deze kolom in de mapping staat
                    if field in reverse_mapping and value in reverse_mapping[field]:
                        new_row[field] = reverse_mapping[field][value]
                    else:
                        new_row[field] = value

                writer.writerow(new_row)

        print(f"✓ Teruggedraaid: {anonymized_csv} → {output_csv}")

    def _save_mapping(self):
        """Bewaar mapping naar bestand."""
        with open(self.mapping_path, "w", encoding="utf-8") as f:
            json.dump(self.mapping, f, ensure_ascii=False, indent=2)


def load_config(config_path: str) -> Dict:
    """Laad configuratiebestand."""
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description="Reversibele anonimisering van CSV-bestanden"
    )
    subparsers = parser.add_subparsers(dest="command", help="Commando")

    # Anonimiseer commando
    parser_anon = subparsers.add_parser(
        "anonymize", help="Anonimiseer een CSV-bestand"
    )
    parser_anon.add_argument("input", help="Input CSV-bestand")
    parser_anon.add_argument("output", help="Output CSV-bestand")
    parser_anon.add_argument(
        "--config",
        required=True,
        help="Configuratiebestand (JSON) met kolom -> strategie mapping",
    )
    parser_anon.add_argument(
        "--mapping",
        default="mapping.json",
        help="Pad naar mapping-bestand (default: mapping.json)",
    )
    parser_anon.add_argument(
        "--remove",
        nargs="+",
        help="Kolommen die volledig verwijderd moeten worden",
    )

    # Terugdraaien commando
    parser_deanon = subparsers.add_parser(
        "deanonymize", help="Draai anonimisering terug"
    )
    parser_deanon.add_argument("input", help="Geanonimiseerde CSV-bestand")
    parser_deanon.add_argument("output", help="Output CSV-bestand met originele waarden")
    parser_deanon.add_argument(
        "--mapping",
        required=True,
        help="Pad naar mapping-bestand",
    )

    args = parser.parse_args()

    if args.command == "anonymize":
        if not os.path.exists(args.input):
            print(f"Fout: Input bestand niet gevonden: {args.input}", file=sys.stderr)
            sys.exit(1)
        if not os.path.exists(args.config):
            print(f"Fout: Configuratiebestand niet gevonden: {args.config}", file=sys.stderr)
            sys.exit(1)

        config = load_config(args.config)
        anonymizer = CSVAnonymizer(args.mapping)
        anonymizer.anonymize(args.input, args.output, config, args.remove)

    elif args.command == "deanonymize":
        if not os.path.exists(args.input):
            print(f"Fout: Input bestand niet gevonden: {args.input}", file=sys.stderr)
            sys.exit(1)
        if not os.path.exists(args.mapping):
            print(f"Fout: Mapping-bestand niet gevonden: {args.mapping}", file=sys.stderr)
            sys.exit(1)

        anonymizer = CSVAnonymizer(args.mapping)
        anonymizer.deanonymize(args.input, args.output)

    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
