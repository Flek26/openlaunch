"""Tests for launch_monitor module."""

import pytest
from datetime import datetime

from openlaunch.launch_monitor import (
    Shot,
    ClubType,
    estimate_carry_distance,
    LaunchMonitor,
)


class TestEstimateCarryDistance:
    """Tests for the carry distance estimation function."""

    def test_driver_150_mph(self):
        """150 mph driver should be around 265 yards."""
        carry = estimate_carry_distance(150, ClubType.DRIVER)
        assert 250 <= carry <= 280

    def test_driver_100_mph(self):
        """100 mph driver should be around 136 yards."""
        carry = estimate_carry_distance(100, ClubType.DRIVER)
        assert 130 <= carry <= 145

    def test_driver_180_mph(self):
        """180 mph driver (pro level) should be around 335 yards."""
        carry = estimate_carry_distance(180, ClubType.DRIVER)
        assert 320 <= carry <= 350

    def test_iron_7_lower_than_driver(self):
        """7 iron at same ball speed should carry less than driver."""
        driver_carry = estimate_carry_distance(120, ClubType.DRIVER)
        iron_carry = estimate_carry_distance(120, ClubType.IRON_7)
        assert iron_carry < driver_carry

    def test_club_factor_ordering(self):
        """Longer clubs should have higher distance factors."""
        ball_speed = 130
        driver = estimate_carry_distance(ball_speed, ClubType.DRIVER)
        wood_3 = estimate_carry_distance(ball_speed, ClubType.WOOD_3)
        iron_5 = estimate_carry_distance(ball_speed, ClubType.IRON_5)
        iron_9 = estimate_carry_distance(ball_speed, ClubType.IRON_9)
        pw = estimate_carry_distance(ball_speed, ClubType.PW)

        assert driver > wood_3 > iron_5 > iron_9 > pw

    def test_low_speed_extrapolation(self):
        """Very low speeds should still return positive distance."""
        carry = estimate_carry_distance(50, ClubType.DRIVER)
        assert carry > 0
        assert carry < 100

    def test_high_speed_extrapolation(self):
        """Very high speeds should extrapolate reasonably."""
        carry = estimate_carry_distance(220, ClubType.DRIVER)
        assert carry > 400
        assert carry < 500


class TestShot:
    """Tests for the Shot dataclass."""

    def test_basic_shot_creation(self):
        """Create a basic shot with ball speed only."""
        shot = Shot(ball_speed_mph=150.0, timestamp=datetime.now())
        assert shot.ball_speed_mph == 150.0
        assert shot.club == ClubType.DRIVER  # default

    def test_shot_with_club_speed(self):
        """Shot with both ball and club speed."""
        shot = Shot(
            ball_speed_mph=150.0,
            club_speed_mph=103.0,
            timestamp=datetime.now(),
        )
        assert shot.ball_speed_mph == 150.0
        assert shot.club_speed_mph == 103.0

    def test_smash_factor_calculation(self):
        """Smash factor should be ball_speed / club_speed."""
        shot = Shot(
            ball_speed_mph=150.0,
            club_speed_mph=100.0,
            timestamp=datetime.now(),
        )
        assert shot.smash_factor == 1.5

    def test_smash_factor_none_without_club_speed(self):
        """Smash factor should be None if no club speed."""
        shot = Shot(ball_speed_mph=150.0, timestamp=datetime.now())
        assert shot.smash_factor is None

    def test_speed_unit_conversion(self):
        """Test mph to m/s conversion."""
        shot = Shot(
            ball_speed_mph=100.0,
            club_speed_mph=70.0,
            timestamp=datetime.now(),
        )
        # 100 mph ~= 44.7 m/s
        assert 44.5 <= shot.ball_speed_ms <= 44.9
        assert 31.0 <= shot.club_speed_ms <= 31.5

    def test_estimated_carry_uses_club_type(self):
        """Estimated carry should vary by club type."""
        driver_shot = Shot(
            ball_speed_mph=140.0,
            timestamp=datetime.now(),
            club=ClubType.DRIVER,
        )
        iron_shot = Shot(
            ball_speed_mph=140.0,
            timestamp=datetime.now(),
            club=ClubType.IRON_7,
        )
        assert driver_shot.estimated_carry_yards > iron_shot.estimated_carry_yards

    def test_carry_range(self):
        """Carry range should be ±10% of estimate."""
        shot = Shot(ball_speed_mph=150.0, timestamp=datetime.now())
        low, high = shot.estimated_carry_range
        estimate = shot.estimated_carry_yards

        assert low == pytest.approx(estimate * 0.90, rel=0.01)
        assert high == pytest.approx(estimate * 1.10, rel=0.01)


class TestLaunchMonitorSessionStats:
    """Tests for LaunchMonitor session statistics."""

    def test_empty_session_stats(self):
        """Empty session should return zeros."""
        monitor = LaunchMonitor.__new__(LaunchMonitor)
        monitor._shots = []

        stats = monitor.get_session_stats()

        assert stats["shot_count"] == 0
        assert stats["avg_ball_speed"] == 0
        assert stats["max_ball_speed"] == 0
        assert stats["min_ball_speed"] == 0
        assert stats["avg_club_speed"] is None
        assert stats["avg_smash_factor"] is None
        assert stats["avg_carry_est"] == 0

    def test_single_shot_stats(self):
        """Stats with a single shot."""
        monitor = LaunchMonitor.__new__(LaunchMonitor)
        monitor._shots = [
            Shot(ball_speed_mph=150.0, club_speed_mph=100.0, timestamp=datetime.now())
        ]

        stats = monitor.get_session_stats()

        assert stats["shot_count"] == 1
        assert stats["avg_ball_speed"] == 150.0
        assert stats["max_ball_speed"] == 150.0
        assert stats["min_ball_speed"] == 150.0
        assert stats["avg_club_speed"] == 100.0
        assert stats["avg_smash_factor"] == 1.5

    def test_multiple_shots_stats(self):
        """Stats with multiple shots."""
        monitor = LaunchMonitor.__new__(LaunchMonitor)
        monitor._shots = [
            Shot(ball_speed_mph=140.0, club_speed_mph=95.0, timestamp=datetime.now()),
            Shot(ball_speed_mph=150.0, club_speed_mph=100.0, timestamp=datetime.now()),
            Shot(ball_speed_mph=160.0, club_speed_mph=108.0, timestamp=datetime.now()),
        ]

        stats = monitor.get_session_stats()

        assert stats["shot_count"] == 3
        assert stats["avg_ball_speed"] == 150.0
        assert stats["max_ball_speed"] == 160.0
        assert stats["min_ball_speed"] == 140.0

    def test_clear_session(self):
        """Clear session should reset shots."""
        monitor = LaunchMonitor.__new__(LaunchMonitor)
        monitor._shots = [
            Shot(ball_speed_mph=150.0, timestamp=datetime.now())
        ]

        monitor.clear_session()

        assert monitor._shots == []
        assert monitor.get_session_stats()["shot_count"] == 0

    def test_set_club(self):
        """Set club should update current club."""
        monitor = LaunchMonitor.__new__(LaunchMonitor)
        monitor._current_club = ClubType.DRIVER

        monitor.set_club(ClubType.IRON_7)

        assert monitor._current_club == ClubType.IRON_7
