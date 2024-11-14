echo building linux binary
bun build --compile --target=bun-linux-x64 . --outfile installer/builds/auto-awesome-wallpapers

echo building windows binary
bun build --compile --target=bun-windows-x64 . --outfile installer/builds/auto-awesome-wallpapers.exe

cd installer

echo building linux installer binary
bun build --compile --target=bun-linux-x64 . --outfile builds/install-auto-awesome-wallpapers

echo building windows installer binary
bun build --compile --target=bun-windows-x64 . --outfile builds/install-auto-awesome-wallpapers.exe