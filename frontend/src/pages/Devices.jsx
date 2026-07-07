import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

const DeviceTable = () => {
    const [devices, setDevices] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch("/devices");
                if (!response.ok) {
                    throw new Error(`Failed to fetch devices: ${response.status}`);
                }
                const data = await response.json();
                setDevices(data);
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        };
        fetchDevices();
    }, []);

    const handleMenuOpen = (event, device) => {
        setAnchorEl(event.currentTarget);
        setSelectedDevice(device);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedDevice(null);
    };

    const handleScheduleOpen = () => {
        setIsScheduleDialogOpen(true);
        setSelectedAction("schedule");
        handleMenuClose();
    };

    const handleScheduleClose = () => {
        setIsScheduleDialogOpen(false);
        setSelectedAction(null);
    };

    const handleAction = (action) => {
        switch (action) {
            case "schedule":
                handleScheduleOpen();
                break;
            case "edit":
                // Handle edit action
                break;
            case "remove":
                // Handle remove action
                break;
            default:
                break;
        }
    };

    const handlePerformAction = async () => {
        if (!selectedDevice) return;
        try {
            switch (selectedAction) {
                case "schedule":
                    // Perform schedule action with selectedDevice._id
                    console.log(`Scheduled action for device ${selectedDevice._id}`);
                    break;
                case "edit":
                    // Perform edit action with selectedDevice._id
                    break;
                case "remove":
                    // Perform remove action with selectedDevice._id
                    break;
                default:
                    break;
            }
            handleScheduleClose();
        } catch (error) {
            console.error("Error performing action:", error);
        }
    };

    const navigate = useNavigate();
    return (
        <div style={{ overflowX: "auto", width: "80vw" }}>
            <br />
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/add-device")}>
                Add Device
            </Button>
            <br />
            <br />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Device Name</TableCell>
                            <TableCell>Serial Number</TableCell>
                            <TableCell>Device Type</TableCell>
                            <TableCell>Hardware Type</TableCell>
                            <TableCell>Site</TableCell>
                            <TableCell>Group</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Connectivity Type</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell>Port</TableCell>
                            <TableCell>Login User</TableCell>
                            <TableCell>Password</TableCell>
                            <TableCell>Read Community</TableCell>
                            <TableCell>Write Community</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {devices.map((device, index) => (
                            <TableRow key={index}>
                                <TableCell>{device.deviceName}</TableCell>
                                <TableCell>{device.deviceSlNo}</TableCell>
                                <TableCell>{device.deviceType}</TableCell>
                                <TableCell>{device.hwType}</TableCell>
                                <TableCell>{device.site}</TableCell>
                                <TableCell>{device.group}</TableCell>
                                <TableCell>{device.owner}</TableCell>
                                <TableCell>{device.connectivityType}</TableCell>
                                <TableCell>{device.ip}</TableCell>
                                <TableCell>{device.port}</TableCell>
                                <TableCell>{device.loginUser}</TableCell>
                                <TableCell>{device.password}</TableCell>
                                <TableCell>{device.readCommunity}</TableCell>
                                <TableCell>{device.writeCommunity}</TableCell>
                                <TableCell>
                                    <IconButton
                                        aria-label="more"
                                        aria-controls={`device-menu-${index}`}
                                        aria-haspopup="true"
                                        onClick={(event) => handleMenuOpen(event, device)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        id={`device-menu-${index}`}
                                        anchorEl={anchorEl}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem onClick={() => handleAction("schedule")}>Schedule</MenuItem>
                                        <MenuItem onClick={() => handleAction("edit")}>Edit</MenuItem>
                                        <MenuItem onClick={() => handleAction("remove")}>Remove</MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={isScheduleDialogOpen} onClose={handleScheduleClose}>
                <DialogTitle>Schedule Action</DialogTitle>
                <DialogContent>
                    {/* Add content for scheduling here */}
                    Schedule dialog content...
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleScheduleClose}>Cancel</Button>
                    <Button onClick={handlePerformAction} color="primary">
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DeviceTable;
