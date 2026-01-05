# Windows Build Setup

## Issue: Linker `cc` not found

This error occurs because Rust needs a C compiler to build native dependencies (like `serialport`).

## Solution Options

### Option 1: Install Microsoft C++ Build Tools (Recommended)

1. Download and install **Microsoft C++ Build Tools**:
   - Go to: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Download "Build Tools for Visual Studio"
   - During installation, select:
     - **C++ build tools** workload
     - **Windows 10/11 SDK** (latest version)
     - **MSVC v143 - VS 2022 C++ x64/x86 build tools**

2. Restart your terminal/PowerShell after installation

3. Try building again:
   ```bash
   cargo build --release
   ```

### Option 2: Install Visual Studio (Full IDE)

If you prefer the full Visual Studio IDE:
- Download Visual Studio Community (free)
- During installation, select "Desktop development with C++" workload
- This includes everything needed

### Option 3: Use GNU Toolchain (Alternative)

If you prefer MinGW/GCC:

1. Install **MSYS2** (includes MinGW-w64):
   - Download from: https://www.msys2.org/
   - Follow installation instructions

2. Install MinGW-w64 toolchain:
   ```bash
   pacman -S mingw-w64-x86_64-gcc
   ```

3. Add to PATH:
   - Add `C:\msys64\mingw64\bin` to your system PATH

4. Configure Rust to use GNU toolchain:
   ```bash
   rustup toolchain install stable-x86_64-pc-windows-gnu
   rustup default stable-x86_64-pc-windows-gnu
   ```

5. Build:
   ```bash
   cargo build --release
   ```

## Verify Installation

After installing, verify the compiler is available:

```bash
# For MSVC (Option 1 or 2)
where cl

# For MinGW (Option 3)
where gcc
```

## Quick Test

Once installed, try building:

```bash
cargo build --release
```

If you still get errors, make sure:
1. Terminal was restarted after installation
2. PATH environment variable includes the compiler
3. You're using the correct Rust toolchain

## Alternative: Use WSL (Windows Subsystem for Linux)

If you have WSL installed, you can build in Linux:

```bash
wsl
cd /mnt/z/openlaunch
cargo build --release
```

This avoids Windows-specific build tool issues.

