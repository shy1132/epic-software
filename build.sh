echo building linux binary
bun build --compile --target=bun-linux-x64 . --outfile installer/builds/epic-software

echo building windows binary
bun build --compile --target=bun-windows-x64 . --outfile installer/builds/epic-software.exe

cd installer

echo building linux installer binary
bun build --compile --target=bun-linux-x64 . --outfile builds/install-epic-software

echo building windows installer binary
bun build --compile --target=bun-windows-x64 . --outfile builds/install-epic-software.exe