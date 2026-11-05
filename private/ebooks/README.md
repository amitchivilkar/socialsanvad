# Private ebook files

Place PDFs here (gitignored). Filenames must match `lib/ebooks.ts`:

| Product | File |
|---------|------|
| 1.0 | `karykartyachi-ai-diary.pdf` |
| 2.0 | `karyakartyachi-ai-diary-2.0.pdf` |
| Bundle | both files above |

Optional legacy override for 1.0 only: `EBOOK_PDF_URL` or `EBOOK_PDF_PATH`.

The download API streams files only after a valid paid token check
(max 5 downloads, 72h expiry). Bundle orders show both files on the
download page; each file click counts as one download.
