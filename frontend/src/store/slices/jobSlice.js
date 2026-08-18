import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Fetch jobs created by the logged-in employer
export const fetchMyJobs = createAsyncThunk(
  "jobs/fetchMyJobs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/jobs/my-jobs"); // Endpoint to fetch employer's jobs
      return res.data.jobs || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch jobs");
    }
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    myJobs: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Add newly created job directly to state
    addPostedJob: (state, action) => {
      state.myJobs.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.myJobs = action.payload;
      })
      .addCase(fetchMyJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addPostedJob } = jobSlice.actions;
export default jobSlice.reducer;