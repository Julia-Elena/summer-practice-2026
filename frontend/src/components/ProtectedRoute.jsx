import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
	const accessToken = sessionStorage.getItem("access_token");

	if (!accessToken) {
		return <Navigate to="/login" replace />;
	}

	return children;
};
