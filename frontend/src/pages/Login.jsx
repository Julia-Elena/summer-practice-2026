import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	let navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setErrorMessage("");

		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();
			console.log(data);
			if (data.access_token) {
				sessionStorage.setItem("access_token", data.access_token);
				sessionStorage.setItem("role", data.role || "");
				sessionStorage.setItem("group", data.group || "");
				sessionStorage.setItem(
					"name",
					data.name || data.loggedinUser || username,
				);
				navigate("/home");
			} else {
				setErrorMessage("Invalid credentials");
			}
		} catch (error) {
			console.error("Error:", error);
			setErrorMessage("Unable to login right now. Please try again.");
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: { xs: "column", md: "row" },
			}}
		>
			<Box
				sx={{
					width: { xs: "100%", md: "50%" },
					minHeight: { xs: "35vh", md: "100vh" },
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "flex-start",
					px: { xs: 4, md: 8 },
					py: { xs: 6, md: 8 },
					color: "common.white",
					bgcolor: "primary.main",
				}}
			>
				<Typography variant="h2" gutterBottom>
					Smart Energy Saving
				</Typography>
				<Typography variant="h4">Let&apos;s start saving power!</Typography>
			</Box>

			<Box
				sx={{
					width: { xs: "100%", md: "50%" },
					minHeight: { xs: "65vh", md: "100vh" },
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					p: 3,
					backgroundColor: "#F4F7F7",
				}}
			>
				<Card sx={{ width: "100%", maxWidth: 420 }}>
					<CardHeader title="Login" sx={{ textAlign: "center", pb: 0 }} />
					<CardContent>
						<form onSubmit={handleLogin}>
							<TextField
								id="username"
								value={username}
								label="Username"
								variant="outlined"
								fullWidth
								onChange={(e) => setUsername(e.target.value)}
							/>
							<Box sx={{ height: 16 }} />
							<TextField
								id="password"
								value={password}
								label="Password"
								type="password"
								variant="outlined"
								fullWidth
								onChange={(e) => setPassword(e.target.value)}
							/>
							<Box sx={{ height: 20 }} />
							<Button variant="contained" type="submit" fullWidth>
								Login
							</Button>
						</form>

						{errorMessage && (
							<Alert severity="error" sx={{ mt: 2 }}>
								{errorMessage}
							</Alert>
						)}
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
}

export default Login;
