import { useState, useEffect, useMemo } from "react";
import {
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
	Container,
	Typography,
	Divider,
	Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
	MaterialReactTable,
	useMaterialReactTable,
} from "material-react-table";
import AddDeviceForm from "../components/AddDeviceForm";
import PageHeader from "../components/PageHeader";
import ScheduleDialog from "../components/ScheduleDialog";

const DeviceTable = () => {
	const [devices, setDevices] = useState([]);
	const [selectedDevice, setSelectedDevice] = useState(null);
	const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
	const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
	const [deviceToDelete, setDeviceToDelete] = useState(null);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [deviceToEdit, setDeviceToEdit] = useState(null);

	const fetchDevices = async () => {
		try {
			const response = await fetch("/api/devices");
			if (!response.ok) {
				throw new Error(`Failed to fetch devices: ${response.status}`);
			}
			const data = await response.json();
			setDevices(data);
		} catch (error) {
			console.error("Error fetching devices:", error);
		}
	};

	useEffect(() => {
		fetchDevices();
	}, []);

	const handleScheduleOpen = (device) => {
		setSelectedDevice(device);
		setIsScheduleDialogOpen(true);
	};

	const handleScheduleClose = () => {
		setIsScheduleDialogOpen(false);
		setSelectedDevice(null);
	};

	const handleAction = (action, device) => {
		switch (action) {
			case "schedule":
				handleScheduleOpen(device);
				break;
			case "edit":
				handleEditOpen(device);
				break;
			case "remove":
				handleRemoveOpen(device);
				break;
			default:
				break;
		}
	};

	const handleEditOpen = (device) => {
		setDeviceToEdit(device);
		setIsAddDialogOpen(true);
	};

	const handleEditClose = () => {
		setIsAddDialogOpen(false);
		setDeviceToEdit(null);
	};

	const handleRemoveOpen = (device) => {
		setDeviceToDelete(device);
		setIsRemoveDialogOpen(true);
	};

	const handleRemoveClose = () => {
		setIsRemoveDialogOpen(false);
		setDeviceToDelete(null);
	};

	const getDeviceId = (device) => {
		if (!device) return null;

		const idValue = device.id ?? device._id;
		if (!idValue) return null;

		if (typeof idValue === "object") {
			if (typeof idValue.$oid === "string") return idValue.$oid;
			if (typeof idValue.toString === "function") return idValue.toString();
			return null;
		}

		return String(idValue);
	};

	const handleRemoveConfirm = async () => {
		const deviceId = getDeviceId(deviceToDelete);
		if (!deviceId) return;

		try {
			const response = await fetch(
				`/api/device/${encodeURIComponent(deviceId)}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to delete device: ${response.status}`);
			}

			await fetchDevices();
			handleRemoveClose();
		} catch (error) {
			console.error("Error deleting device:", error);
		}
	};

	const columns = useMemo(
		() => [
			{ accessorKey: "deviceName", header: "Device Name" },
			{ accessorKey: "deviceSlNo", header: "Serial Number" },
			{ accessorKey: "deviceType", header: "Device Type" },
			{ accessorKey: "hwType", header: "Hardware Type" },
			{ accessorKey: "site", header: "Site" },
			{ accessorKey: "group", header: "Group" },
			{ accessorKey: "owner", header: "Owner" },
			{
				id: "connection",
				header: "Connection",
				accessorFn: (row) => {
					const type = row.connectivityType || "-";
					const ip = row.ip || "-";
					const port = row.port || "-";
					return `${type} | ${ip}:${port}`;
				},
			},
		],
		[],
	);

	const table = useMaterialReactTable({
		columns,
		data: devices,
		enableRowActions: true,
		positionActionsColumn: "last",
		muiTableContainerProps: {},
		muiTablePaperProps: {
			elevation: 0,
		},
		renderTopToolbarCustomActions: () => (
			<Button
				variant="outlined"
				startIcon={<AddIcon />}
				onClick={handleAddDialogOpen}
			>
				Add Device
			</Button>
		),
		renderRowActionMenuItems: ({ row, closeMenu }) => [
			<MenuItem
				key="schedule"
				onClick={() => {
					handleAction("schedule", row.original);
					closeMenu();
				}}
			>
				Schedule
			</MenuItem>,
			<MenuItem
				key="edit"
				onClick={() => {
					handleAction("edit", row.original);
					closeMenu();
				}}
			>
				Edit
			</MenuItem>,
			<MenuItem
				key="remove"
				onClick={() => {
					handleAction("remove", row.original);
					closeMenu();
				}}
			>
				Remove
			</MenuItem>,
		],
	});

	const handleAddDialogOpen = () => {
		if (deviceToEdit) {
			handleEditOpen(deviceToEdit);
		} else {
			setIsAddDialogOpen(true);
		}
	};

	const handleAddDialogClose = () => {
		if (deviceToEdit) {
			handleEditClose();
		} else {
			setIsAddDialogOpen(false);
		}
	};

	const handleAddDeviceSuccess = () => {
		fetchDevices();
	};

	return (
		<Container maxWidth={false} disableGutters>
			<PageHeader title="Devices" breadcrumbItems={["Home", "Devices"]} />
			<MaterialReactTable table={table} />
			<ScheduleDialog
				open={isScheduleDialogOpen}
				device={selectedDevice}
				deviceId={getDeviceId(selectedDevice)}
				onClose={handleScheduleClose}
				onSave={handleScheduleClose}
			/>
			<Dialog open={isRemoveDialogOpen} onClose={handleRemoveClose}>
				<DialogTitle>Confirm Device Removal</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to remove{" "}
						{deviceToDelete?.deviceName || "this device"}? This action cannot be
						undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleRemoveClose}>Cancel</Button>
					<Button onClick={handleRemoveConfirm} color="error">
						Remove
					</Button>
				</DialogActions>
			</Dialog>
			<AddDeviceForm
				open={isAddDialogOpen}
				onClose={handleAddDialogClose}
				onSuccess={handleAddDeviceSuccess}
				mode={deviceToEdit ? "edit" : "add"}
				initialData={deviceToEdit}
				deviceId={getDeviceId(deviceToEdit)}
			/>
		</Container>
	);
};

export default DeviceTable;
