import { toast } from "react-hot-toast";
import { setLoading, setToken } from "../../slices/authSlice";
import { resetCart } from "../../slices/cartSlice";
import { setUser } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints;

export function sendOtp(email, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      // Send OTP API request
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      }, { timeout: 10000 });  // Set timeout to 10 seconds

      console.log("SENDOTP API RESPONSE:", response);

      // Ensure response is successful
      if (!response?.data?.success) {
        console.error("Error sending OTP:", response?.data?.message);
        throw new Error(response?.data?.message || "Unknown error");
      }

      toast.success("OTP Sent Successfully");
      navigate("/verify-email");
    } catch (error) {
      console.error("SENDOTP API ERROR:", error);
      toast.error(error.message || "Could Not Send OTP");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
  navigate
) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      // Sign up API request
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      }, { timeout: 10000 }); // Set timeout to 10 seconds

      console.log("SIGNUP API RESPONSE:", response);

      // Ensure response is successful
      if (!response?.data?.success) {
        console.error("Sign up error:", response?.data?.message);
        throw new Error(response?.data?.message || "Unknown error");
      }

      toast.success("Signup Successful");
      navigate("/login");
    } catch (error) {
      console.error("SIGNUP API ERROR:", error);
      toast.error(error.message || "Signup Failed");
      navigate("/signup");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      // Login API request
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      }, { timeout: 10000 }); // Set timeout to 10 seconds

      console.log("LOGIN API RESPONSE:", response);

      // Ensure response is successful
      if (!response?.data?.success) {
        console.error("Login error:", response?.data?.message);
        throw new Error(response?.data?.message || "Unknown error");
      }

      toast.success("Login Successful");

      // Set token and user data in the store
      dispatch(setToken(response?.data?.token));
      const userImage = response?.data?.user?.image
        ? response?.data?.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response?.data?.user.firstName} ${response?.data?.user.lastName}`;
      dispatch(setUser({ ...response?.data?.user, image: userImage }));

      // Store token in localStorage
      localStorage.setItem("token", JSON.stringify(response?.data?.token));

      navigate("/dashboard/my-profile");
    } catch (error) {
      console.error("LOGIN API ERROR:", error);
      toast.error(error.message || "Login Failed");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      // Password reset token request
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      }, { timeout: 10000 }); // Set timeout to 10 seconds

      console.log("RESETPASSTOKEN RESPONSE:", response);

      // Ensure response is successful
      if (!response?.data?.success) {
        console.error("Password reset token error:", response?.data?.message);
        throw new Error(response?.data?.message || "Unknown error");
      }

      toast.success("Reset Email Sent");
      setEmailSent(true);
    } catch (error) {
      console.error("RESETPASSTOKEN ERROR:", error);
      toast.error(error.message || "Failed To Send Reset Email");
    }
    toast.dismiss(toastId);
    dispatch(setLoading(false));
  };
}

export function resetPassword(password, confirmPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      // Password reset request
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      }, { timeout: 10000 }); // Set timeout to 10 seconds

      console.log("RESETPASSWORD RESPONSE:", response);

      // Ensure response is successful
      if (!response?.data?.success) {
        console.error("Password reset error:", response?.data?.message);
        throw new Error(response?.data?.message || "Unknown error");
      }

      toast.success("Password Reset Successfully");
      navigate("/login");
    } catch (error) {
      console.error("RESETPASSWORD ERROR:", error);
      toast.error(error.message || "Failed To Reset Password");
    }
    toast.dismiss(toastId);
    dispatch(setLoading(false));
  };
}

export function logout(navigate) {
  return (dispatch) => {
    // Clear authentication data
    dispatch(setToken(null));
    dispatch(setUser(null));
    dispatch(resetCart());
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged Out");
    navigate("/");
  };
}
