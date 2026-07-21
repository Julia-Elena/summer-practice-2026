import {
	Box,
	Card,
	CardContent,
	Container,
	Grid,
	Typography,
} from "@mui/material";
import DevicesIcon from "@mui/icons-material/Devices";
import BoltIcon from "@mui/icons-material/Bolt";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";

function Dashboard() {
	const [registeredDevices, setRegisteredDevices] = useState(0);
	const [weeklyConsumption, setWeeklyConsumption] = useState([]);

	useEffect(() => {
		const fetchRegisteredDevices = async () => {
			try {
				const response = await fetch("/api/devices");
				if (!response.ok) {
					throw new Error(
						`Failed to fetch registered devices: ${response.status}`,
					);
				}
				const data = await response.json();
				setRegisteredDevices(data.length);
			} catch (error) {
				console.error("Error fetching registered devices:", error);
			}
		};

		const fetchWeeklyConsumption = async () => {
			try {
				const response = await fetch("/api/consumption/weekly");
				if (!response.ok) {
					throw new Error(
						`Failed to fetch weekly consumption: ${response.status}`,
					);
				}
				const data = await response.json();
				setWeeklyConsumption(data);
			} catch (error) {
				console.error("Error fetching weekly consumption:", error);
			}
		};

		fetchRegisteredDevices();
		fetchWeeklyConsumption();
	}, []);

	const stats = [
		{
			label: "Registered Devices",
			value: registeredDevices,
			unit: "devices",
			icon: <DevicesIcon sx={{ fontSize: 40 }} />,
			color: "primary.main",
		},
		{
			label: "Total Power Consumption",
			value: weeklyConsumption
				.reduce((acc, day) => acc + day.usage, 0)
				.toFixed(2),
			unit: "kWh this week",
			icon: <BoltIcon sx={{ fontSize: 40 }} />,
			color: "warning.main",
		},
		{
			label: "Energy Saved",
			value: weeklyConsumption
				.reduce((acc, day) => acc + day.saved, 0)
				.toFixed(2),
			unit: "kWh this week",
			icon: <EnergySavingsLeafIcon sx={{ fontSize: 40 }} />,
			color: "success.main",
		},
	];

	return (
		<Container maxWidth={false} disableGutters>
			<PageHeader title="Dashboard" breadcrumbItems={["Home", "Dashboard"]} />

			<Grid container spacing={3} sx={{ mt: 1 }}>
				{stats.map(({ label, value, unit, icon, color }) => (
					<Grid size={{ xs: 12, sm: 6, md: 4 }} key={label}>
						<Card elevation={2} sx={{ height: "100%" }}>
							<CardContent
								sx={{ display: "flex", alignItems: "center", gap: 2 }}
							>
								<Box sx={{ color }}>{icon}</Box>
								<Box>
									<Typography variant="body2" color="text.secondary">
										{label}
									</Typography>
									<Typography variant="h4" component="p">
										{value}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{unit}
									</Typography>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			<Card elevation={2} sx={{ mt: 3 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Power Usage This Week
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Daily consumption (kWh) across all registered devices
					</Typography>
					<Box sx={{ width: "100%", height: 320 }}>
						<ResponsiveContainer>
							<AreaChart
								data={weeklyConsumption}
								margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
							>
								<defs>
									<linearGradient
										id="usageGradient"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor="#ed6c02" stopOpacity={0.4} />
										<stop offset="95%" stopColor="#ed6c02" stopOpacity={0} />
									</linearGradient>
									<linearGradient
										id="savedGradient"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor="#2e7d32" stopOpacity={0.4} />
										<stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
								<XAxis dataKey="day" tick={{ fontSize: 12 }} />
								<YAxis
									tick={{ fontSize: 12 }}
									label={{
										value: "kWh",
										angle: -90,
										position: "insideLeft",
										style: { fontSize: 12 },
									}}
								/>
								<Tooltip
									formatter={(value, name) => [
										`${value} kWh`,
										name === "usage" ? "Consumption" : "Saved",
									]}
								/>
								<Area
									type="monotone"
									dataKey="usage"
									name="usage"
									stroke="#ed6c02"
									fill="url(#usageGradient)"
									strokeWidth={2}
								/>
								<Area
									type="monotone"
									dataKey="saved"
									name="saved"
									stroke="#2e7d32"
									fill="url(#savedGradient)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</Box>
				</CardContent>
			</Card>
		</Container>
	);
}

export default Dashboard;
