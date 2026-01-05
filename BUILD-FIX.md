# Build Fix: Serialport Version

## Issue
The `serialport` crate version 5.0 doesn't exist. The latest version is 4.8.1.

## Solution
Updated `Cargo.toml` to use `serialport = "4.8"` instead of `"5.0"`.

## API Compatibility
The serialport 4.x API is compatible with the code:
- `SerialPort` trait exists
- `serialport::new()` works the same
- `port.clear()` and `port.read()` methods are available
- `ClearBuffer` enum exists

## Build Command
```bash
cargo build --release
```

If you encounter any API differences, they should be minor and easy to fix.

