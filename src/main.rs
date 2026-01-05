mod ops243;
mod launch_monitor;
mod shot;

use anyhow::Result;
use clap::Parser;

use ops243::OPS243Radar;
use launch_monitor::LaunchMonitor;

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
}

fn main() -> Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let args = Args::parse();

    println!("{}", "=".repeat(50));
    println!("  OpenLaunch - Golf Launch Monitor (Rust)");
    println!("  Using OPS243-A Doppler Radar");
    println!("{}", "=".repeat(50));
    println!();

    // Connect to radar
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

    // Create launch monitor
    let mut monitor = LaunchMonitor::new(radar, args.live);

    // Main loop - process shots
    monitor.run()?;

    Ok(())
}

