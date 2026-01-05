mod ops243;
mod launch_monitor;
mod shot;
mod mock_radar;

use anyhow::Result;
use clap::Parser;

use ops243::OPS243Radar;
use launch_monitor::{LaunchMonitor, RadarInterface};
use mock_radar::MockRadar;

#[derive(Parser, Debug)]
#[command(name = "openlaunch-rs")]
#[command(about = "Golf Launch Monitor (Rust) - Phase 1", long_about = None)]
struct Args {
    /// Serial port (auto-detect if not specified)
    #[arg(short, long)]
    port: Option<String>,

    /// Show live readings
    #[arg(short, long)]
    live: bool,

    /// Show radar info and exit
    #[arg(short, long)]
    info: bool,

    /// Use mock radar (for testing without hardware)
    #[arg(short, long)]
    mock: bool,

    /// Shot interval in seconds for mock mode (auto-generate shots)
    #[arg(long, default_value = "5.0")]
    mock_interval: f64,
}

fn main() -> Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let args = Args::parse();

    println!("{}", "=".repeat(50));
    println!("  OpenLaunch - Golf Launch Monitor (Rust)");
    if args.mock {
        println!("  Using MOCK Radar (Simulation Mode)");
    } else {
        println!("  Using OPS243-A Doppler Radar");
    }
    println!("{}", "=".repeat(50));
    println!();

    // Connect to radar (real or mock)
    if args.mock {
        let mut radar = MockRadar::new(args.mock_interval, true);
        radar.connect()?;
        radar.configure_for_golf()?;
        let info = radar.get_info()?;
        println!("Connected to: {}", info.get("Product").unwrap_or(&"OPS243-MOCK".to_string()));
        println!("Firmware: {}", info.get("Version").unwrap_or(&"unknown".to_string()));
        println!("Mode: {}", info.get("Mode").unwrap_or(&"Simulation".to_string()));
        println!();

        if args.info {
            println!("Radar Configuration:");
            for (key, value) in &info {
                println!("  {}: {}", key, value);
            }
            return Ok(());
        }

        println!("Mock mode: Auto-generating shots every {:.1} seconds", args.mock_interval);
        println!("Press Ctrl+C to stop");
        println!();
        
        // Create launch monitor with mock radar
        let mut monitor = LaunchMonitor::new(radar, args.live);
        monitor.run()?;
    } else {
        let mut radar = OPS243Radar::new(args.port.clone())?;
        radar.connect()?;
        radar.configure_for_golf()?;
        let info = radar.get_info()?;
        println!("Connected to: {}", info.get("Product").unwrap_or(&"OPS243".to_string()));
        println!("Firmware: {}", info.get("Version").unwrap_or(&"unknown".to_string()));
        println!();

        if args.info {
            println!("Radar Configuration:");
            for (key, value) in &info {
                println!("  {}: {}", key, value);
            }
            return Ok(());
        }

        println!("Ready! Swing when ready...");
        println!("Press Ctrl+C to stop");
        println!();
        
        // Create launch monitor with real radar
        let mut monitor = LaunchMonitor::new(radar, args.live);
        monitor.run()?;
    }

    Ok(())
}

