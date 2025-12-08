# OpenLaunch

A DIY golf launch monitor built with a Raspberry Pi 5, CDM324/HB100 Doppler radar, and MCP3008 ADC.

## Overview

OpenLaunch uses Doppler radar to measure golf ball speed. The system captures the frequency shift caused by the moving ball and converts it to ball speed using FFT analysis.

**Current Features (Phase 1):**
- Ball speed measurement (mph/km/h)
- Estimated carry distance
- Live signal monitoring mode
- Session data saving (JSON)
- Support for CDM324 and HB100 radar modules

**Planned Features (Phase 2):**
- Camera-based spin detection
- Launch angle measurement
- Club head speed

## Hardware Requirements

- Raspberry Pi 5 (Pi 4 should also work)
- CDM324 or HB100 Doppler radar module
- MCP3008 ADC (10-bit, SPI)
- LM358 op-amp module (for signal amplification)
- Breadboard and jumper wires
- 5V power supply

See [golf-launch-monitor-wiring-guide.md](golf-launch-monitor-wiring-guide.md) for detailed wiring instructions.

## Quick Start

### 1. Install uv (Python package manager)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Clone and setup

```bash
git clone https://github.com/yourusername/openlaunch.git
cd openlaunch
uv sync
```

### 3. Enable SPI on Raspberry Pi

```bash
sudo raspi-config
# Navigate to: Interface Options → SPI → Enable
sudo reboot
```

### 4. Run diagnostics

```bash
uv run python diagnose.py
```

### 5. Start the launch monitor

```bash
uv run python launch_monitor.py
```

## Usage

### Launch Monitor (main application)

```bash
# Standard mode - wait for shots
uv run python launch_monitor.py

# Live signal monitor - continuous display
uv run python launch_monitor.py --live

# Use HB100 radar instead of CDM324
uv run python launch_monitor.py --radar hb100

# Adjust sensitivity (lower = more sensitive)
uv run python launch_monitor.py --sensitivity 1000

# Metric units
uv run python launch_monitor.py --units metric
```

### Diagnostics

```bash
# Run all hardware tests
uv run python diagnose.py

# Test specific components
uv run python diagnose.py --spi      # SPI/ADC only
uv run python diagnose.py --radar    # Radar only
uv run python diagnose.py --camera   # Camera only (Phase 2)

# Live monitoring modes
uv run python diagnose.py --live     # Live radar signal
uv run python diagnose.py --adc      # Live ADC values
```

## Hardware Setup

### Pin Connections (MCP3008 to Raspberry Pi)

| MCP3008 Pin | Function | Pi GPIO | Pi Pin |
|-------------|----------|---------|--------|
| 16 (VDD)    | Power    | 3.3V    | 1      |
| 15 (VREF)   | Reference| 3.3V    | 1      |
| 14 (AGND)   | Analog GND | GND   | 6      |
| 13 (CLK)    | SPI Clock| GPIO 11 | 23     |
| 12 (DOUT)   | SPI MISO | GPIO 9  | 21     |
| 11 (DIN)    | SPI MOSI | GPIO 10 | 19     |
| 10 (CS)     | Chip Select | GPIO 8 | 24   |
| 9 (DGND)    | Digital GND | GND  | 6      |
| 1 (CH0)     | Signal Input | LM358 OUT | - |

### Signal Chain

```
Radar (CDM324/HB100) → LM358 Amplifier → MCP3008 ADC → Raspberry Pi
         IF out              100x gain        CH0          SPI
```

**Important:**
- MCP3008 runs on **3.3V only** - do not connect to 5V
- Radar and LM358 run on **5V**
- Ensure common ground between all components

## Project Structure

```
openlaunch/
├── launch_monitor.py          # Main application
├── diagnose.py                # Hardware diagnostics
├── setup.sh                   # Legacy setup script
├── golf-launch-monitor-wiring-guide.md  # Detailed wiring instructions
├── pyproject.toml             # Python dependencies (uv)
├── shots/                     # Saved session data
└── README.md
```

## How It Works

1. **Doppler Effect**: The radar emits microwaves at 24.125 GHz (CDM324) or 10.525 GHz (HB100). Moving objects cause a frequency shift proportional to their speed.

2. **Signal Amplification**: The raw radar signal is very weak (~µV). The LM358 op-amp boosts it to a level the ADC can read.

3. **Analog to Digital**: The MCP3008 samples the amplified signal at 20 kHz, capturing the Doppler frequency.

4. **FFT Analysis**: Fast Fourier Transform extracts the dominant frequency from the signal, which is converted to speed using the Doppler equation.

### Doppler Constants

| Radar  | Frequency  | Hz per mph |
|--------|------------|------------|
| CDM324 | 24.125 GHz | 71.7       |
| HB100  | 10.525 GHz | 31.36      |

## Configuration

Key parameters in `launch_monitor.py`:

```python
@dataclass
class Config:
    radar_type: str = 'cdm324'        # 'cdm324' or 'hb100'
    sample_rate: int = 20000          # ADC sample rate (Hz)
    sample_duration: float = 0.3       # Capture window (seconds)
    trigger_threshold: int = 100       # Motion detection threshold
    min_frequency: int = 300           # ~4 mph minimum
    max_frequency: int = 12000         # ~167 mph maximum
    magnitude_above_noise: float = 2000  # Signal detection threshold
```

## Troubleshooting

### No readings / "Signal too weak"
- Check radar power (5V) and ground connections
- Verify LM358 is amplifying (use `--live` mode to see signal)
- Try lowering sensitivity: `--sensitivity 1000`
- Ensure nothing is blocking the radar's field of view

### Erratic readings
- Check for loose connections
- Add decoupling capacitors near the MCP3008
- Keep radar away from the Pi (RF interference)
- Ensure proper grounding

### SPI not working
- Verify SPI is enabled: `ls /dev/spidev*`
- Check wiring: MOSI, MISO, SCLK, CE0
- Run `diagnose.py --spi` for detailed tests

### ADC reads 0 or 1023 constantly
- Check 3.3V power to MCP3008
- Verify MCP3008 orientation (notch = pin 1)
- Test with `diagnose.py --adc`

## Contributing

Contributions welcome! Areas that need work:
- Phase 2 camera integration for spin detection
- Web UI for shot display
- Data export formats (CSV, golf simulator integration)
- Improved carry distance estimation

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Doppler radar signal processing inspired by various DIY radar projects
- MCP3008 interfacing based on the spidev library documentation
