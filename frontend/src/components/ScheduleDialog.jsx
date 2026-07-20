import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	FormControl,
	FormControlLabel,
	Grid,
	InputAdornment,
	Link,
	Radio,
	RadioGroup,
	Tab,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";

// Inline SVG icon components replacing mui-icons completely
const CalendarIconSVG = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ color: "#757575" }}
	>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);

const ClockIconSVG = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ color: "#757575" }}
	>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);

const HelpIconSVG = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ color: "#9e9e9e", cursor: "pointer" }}
	>
		<circle cx="12" cy="12" r="10" />
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
		<line x1="12" y1="17" x2="12.01" y2="17" />
	</svg>
);

const recurrenceOptions = [
	{
		value: "workdays",
		label: "workdays",
		tooltip: "Schedule runs Monday through Friday",
	},
	{
		value: "everyday",
		label: "everyday",
		tooltip: "Schedule runs every day of the week",
	},
	{
		value: "weekends",
		label: "weekends",
		tooltip: "Schedule runs Saturday and Sunday",
	},
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getActiveDays = (recurrence) => {
	switch (recurrence) {
		case "workdays":
			return [true, true, true, true, true, false, false];
		case "weekends":
			return [false, false, false, false, false, true, true];
		default:
			return [true, true, true, true, true, true, true];
	}
};

const initialValues = {
	startDate: "",
	endDate: "",
	hasEndDate: false,
	powerOffTime: "23:00",
	powerOnTime: "07:00",
	recurrence: "everyday",
};

const ScheduleDialog = ({
	open,
	onClose,
	onSave,
	onRemove,
	device,
	deviceId,
}) => {
	const [tabValue, setTabValue] = useState(0);
	const [values, setValues] = useState(initialValues);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [scheduleId, setScheduleId] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!open || !deviceId) {
			setScheduleId(null);
			return;
		}

		const loadExistingSchedule = async () => {
			setIsLoading(true);
			setError("");
			try {
				const response = await fetch(`/api/schedules/device/${deviceId}`);
				if (!response.ok) {
					throw new Error("Failed to fetch schedules");
				}
				const schedules = await response.json();

				// If a schedule exists for this device, preload it
				if (schedules && schedules.length > 0) {
					const schedule = schedules[0];
					setScheduleId(schedule._id);
					setValues({
						startDate: schedule.startDate || "",
						endDate: schedule.endDate || "",
						hasEndDate: !!schedule.endDate,
						powerOffTime: schedule.powerOffTime || "23:00",
						powerOnTime: schedule.powerOnTime || "07:00",
						recurrence: schedule.recurrence || "everyday",
					});
				} else {
					// No schedule exists, reset to initial values
					setScheduleId(null);
					setValues((prev) => ({
						...initialValues,
						startDate: prev.startDate || new Date().toISOString().slice(0, 10),
					}));
				}
			} catch (err) {
				console.error("Error loading schedule:", err);
				setScheduleId(null);
				setValues((prev) => ({
					...initialValues,
					startDate: prev.startDate || new Date().toISOString().slice(0, 10),
				}));
			} finally {
				setIsLoading(false);
			}
		};

		loadExistingSchedule();
	}, [open, deviceId]);

	const activeDays = useMemo(
		() => getActiveDays(values.recurrence),
		[values.recurrence],
	);

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;
		setValues((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		if (error) {
			setError("");
		}
	};

	const handleToggleEndDate = () => {
		setValues((prev) => ({
			...prev,
			hasEndDate: !prev.hasEndDate,
			endDate: prev.hasEndDate ? "" : prev.endDate,
		}));
	};

	const handleSubmit = async () => {
		if (!deviceId) {
			setError("Device is required to create a schedule.");
			return;
		}

		if (!values.startDate || !values.powerOffTime || !values.powerOnTime) {
			setError("Please fill in the start date and both on/off times.");
			return;
		}

		setIsSaving(true);
		setError("");

		try {
			const json_body = JSON.stringify({
				deviceId,
				startDate: values.startDate,
				endDate: values.hasEndDate ? values.endDate : null,
				powerOffTime: values.powerOffTime,
				powerOnTime: values.powerOnTime,
				recurrence: values.recurrence,
			});

			console.log(json_body);

			// Always POST to /api/schedule - backend will handle create vs update based on deviceId
			const response = await fetch("/api/schedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: json_body,
			});

			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(
					body?.error || `Failed to save schedule: ${response.status}`,
				);
			}

			if (onSave) {
				onSave();
			}
			onClose();
		} catch (submissionError) {
			setError(submissionError.message || "Failed to save schedule.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleRemove = async () => {
		if (!scheduleId) {
			return;
		}

		setIsSaving(true);
		setError("");

		try {
			const response = await fetch(
				`/api/schedule/${encodeURIComponent(scheduleId.$oid)}`,
				{
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(
					body?.error || `Failed to delete schedule: ${response.status}`,
				);
			}

			if (onRemove) {
				onRemove();
			}
			onClose();
		} catch (removalError) {
			setError(removalError.message || "Failed to delete schedule.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			{/* Top Tabs Header */}
			<Tabs
				value={tabValue}
				onChange={(_, newValue) => setTabValue(newValue)}
				variant="fullWidth"
				sx={{ borderBottom: 1, borderColor: "divider" }}
			>
				<Tab
					label="Recurring Scheduler"
					sx={{ textTransform: "none", fontWeight: 600 }}
				/>
			</Tabs>

			<DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
				<Box sx={{ mb: 3, textAlign: "center" }}>
					<Typography
						variant="h6"
						sx={{ color: "text.primary", fontWeight: 500 }}
					>
						{scheduleId ? "Edit Schedule" : "Create Schedule"} for{" "}
						{device?.deviceName || "device"}
					</Typography>
				</Box>

				{isLoading && (
					<Alert severity="info" sx={{ mb: 2 }}>
						Loading schedule...
					</Alert>
				)}

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Grid
					container
					spacing={3}
					sx={{
						opacity: isLoading ? 0.5 : 1,
						pointerEvents: isLoading ? "none" : "auto",
					}}
				>
					{/* Row 1: Start Date & Recurrence Link */}
					<Grid item xs={12}>
						<Grid container spacing={3} alignItems="center">
							<Grid item xs={6}>
								<TextField
									label="Start date*"
									name="startDate"
									type="date"
									variant="standard"
									value={values.startDate}
									onChange={handleChange}
									fullWidth
									InputLabelProps={{ shrink: true }}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<CalendarIconSVG />
											</InputAdornment>
										),
									}}
									required
								/>
							</Grid>

							<Grid item xs={6}>
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
									}}
								>
									<Link
										component="button"
										underline="none"
										onClick={handleToggleEndDate}
										sx={{ fontSize: 13, textAlign: "left", color: "#1976d2" }}
									>
										{values.hasEndDate
											? "Remove recurrence end date"
											: "Set recurrence end date"}
									</Link>
									<Typography
										variant="caption"
										sx={{ color: "text.secondary" }}
									>
										Default: Never
									</Typography>
								</Box>
							</Grid>
						</Grid>
					</Grid>

					{/* Row 1.5: End Date (Conditional) */}
					{values.hasEndDate && (
						<Grid item xs={12}>
							<TextField
								label="End date"
								name="endDate"
								type="date"
								variant="standard"
								value={values.endDate}
								onChange={handleChange}
								fullWidth
								InputLabelProps={{ shrink: true }}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<CalendarIconSVG />
										</InputAdornment>
									),
								}}
							/>
						</Grid>
					)}

					{/* Row 2: Power Off Time & Power On Time */}
					<Grid item xs={12}>
						<Grid container spacing={3}>
							<Grid item xs={6}>
								<TextField
									label="Power off time*"
									name="powerOffTime"
									type="time"
									variant="standard"
									value={values.powerOffTime}
									onChange={handleChange}
									fullWidth
									InputLabelProps={{ shrink: true }}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<ClockIconSVG />
											</InputAdornment>
										),
									}}
									required
								/>
							</Grid>

							<Grid item xs={6}>
								<Typography />
								<TextField
									label="Power on time*"
									name="powerOnTime"
									type="time"
									variant="standard"
									value={values.powerOnTime}
									onChange={handleChange}
									fullWidth
									InputLabelProps={{ shrink: true }}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<ClockIconSVG />
											</InputAdornment>
										),
									}}
									required
								/>
							</Grid>
						</Grid>
					</Grid>

					<Grid item xs={12}>
						<Divider sx={{ my: 1 }} />
					</Grid>

					{/* Recurrence Radio Group */}
					<Grid item xs={12}>
						<FormControl component="fieldset" fullWidth>
							<Typography
								variant="body2"
								sx={{ color: "text.secondary", mb: 1 }}
							>
								Power off/on recurrence:
							</Typography>
							<RadioGroup
								row
								name="recurrence"
								value={values.recurrence}
								onChange={handleChange}
								sx={{ justifyContent: "space-between" }}
							>
								{recurrenceOptions.map((option) => (
									<FormControlLabel
										key={option.value}
										value={option.value}
										control={<Radio size="small" />}
										label={
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Typography variant="body2" sx={{ mr: 0.5 }}>
													{option.label}
												</Typography>
												<Tooltip title={option.tooltip} arrow placement="top">
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<HelpIconSVG />
													</Box>
												</Tooltip>
											</Box>
										}
									/>
								))}
							</RadioGroup>
						</FormControl>
					</Grid>
				</Grid>

				<Divider sx={{ my: 3 }} />

				{/* Scheduling Overview */}
				<Box>
					<Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
						Scheduling overview:
					</Typography>

					<Box
						component="table"
						sx={{ width: "100%", borderCollapse: "collapse" }}
					>
						<thead>
							<tr>
								<Box component="th" sx={{ width: "25%", textAlign: "left" }} />
								{dayLabels.map((day) => (
									<Box
										component="th"
										key={day}
										sx={{ width: "10.7%", textAlign: "center", pb: 1 }}
									>
										<Typography
											variant="caption"
											sx={{ color: "text.secondary", fontWeight: 500 }}
										>
											{day}
										</Typography>
									</Box>
								))}
							</tr>
						</thead>
						<tbody>
							<tr style={{ borderTop: "1px solid #e0e0e0" }}>
								<Box component="td" sx={{ py: 1.5 }}>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										Power On
									</Typography>
								</Box>
								{dayLabels.map((_, index) => (
									<Box
										component="td"
										key={index}
										sx={{ textAlign: "center", py: 1.5 }}
									>
										<Typography
											variant="body2"
											sx={{
												fontWeight: activeDays[index] ? 500 : 400,
												color: activeDays[index]
													? "text.primary"
													: "text.disabled",
											}}
										>
											{activeDays[index] ? values.powerOnTime : "-"}
										</Typography>
									</Box>
								))}
							</tr>
						</tbody>
					</Box>
				</Box>
			</DialogContent>

			{/* Dialog Footer Actions */}
			<DialogActions sx={{ px: 4, pb: 3, justifyContent: "space-between" }}>
				<Button
					onClick={handleRemove}
					disabled={!scheduleId || isSaving || isLoading}
					variant="contained"
					color="error"
					sx={{
						textTransform: "none",
						backgroundColor: "#f44336",
						"&:hover": { backgroundColor: "#d32f2f" },
						"&:disabled": { backgroundColor: "#ccc", color: "#999" },
					}}
				>
					Remove Schedule
				</Button>

				<Box sx={{ display: "flex", gap: 1 }}>
					<Button
						onClick={onClose}
						disabled={isSaving || isLoading}
						variant="outlined"
						color="inherit"
						sx={{ textTransform: "none", borderColor: "divider" }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSaving || isLoading}
						variant="contained"
						color="primary"
						sx={{ textTransform: "none" }}
					>
						{isSaving ? "Submitting..." : "Submit"}
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
};

ScheduleDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSave: PropTypes.func,
	onRemove: PropTypes.func,
	device: PropTypes.object,
	deviceId: PropTypes.string,
};

export default ScheduleDialog;
