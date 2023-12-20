const ResourceSchema = require("../../models/resource/resourceSchema");
const DownloadRecordSchema = require("../../models/download/downloadModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");

const MAX_FREE_DOWNLOADS_PER_DAY = 10; // Maximum allowed downloads for free users per day

const downloadResource = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const resourceId = req.params.id;

  // Check if the resource exists
  const resource = await ResourceSchema.findById(resourceId);
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  // Check if the user has permission to download the resource
  if (user.isSubscribed) {
    // Subscribed user can download both free and premium resources
    const filePath = resource.assets[0].filePath;
    if (!filePath) {
      res.status(404);
      throw new Error("Resource assets not found");
    }

    // Create a new download entry
    await DownloadRecordSchema.create({
      user: user.id,
      resource: resourceId,
      type: resource.resourceType,
      downloadedAt: new Date(),
    });

    // Fetch the asset using Axios and stream it to the response
    try {
      const response = await axios.get(filePath, { responseType: "stream" });

      // Set the appropriate content type and headers for download
      res.setHeader("Content-Type", resource.assets[0].fileType);
      res.setHeader("Content-Disposition", `attachment; filename="${resource.assets[0].fileName}"`);

      // Stream the file to the response
      response.data.pipe(res);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Error fetching asset" });
    }
  } else if (resource.resourceType === "free") {
    // Non-subscribed user can only download free resources
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const downloadsToday = await DownloadRecordSchema.countDocuments({
      user: user._id,
      type: "free",
      downloadedAt: { $gte: today },
    });

    if (downloadsToday >= MAX_FREE_DOWNLOADS_PER_DAY) {
      res.status(403);
      throw new Error("You have reached the maximum daily download limit for free resources.");
    }

    const filePath = resource.assets[0].filePath;
    if (!filePath) {
      res.status(404);
      throw new Error("Resource assets not found");
    }

    // Create a new download entry
    await DownloadRecordSchema.create({
      user: user.id,
      resource: resourceId,
      type: resource.resourceType,
      downloadedAt: new Date(),
    });

    // Fetch the asset using Axios and stream it to the response
    try {
      const response = await axios.get(filePath, { responseType: "stream" });

      // Set the appropriate content type and headers for download
      res.setHeader("Content-Type", resource.assets[0].fileType);
      res.setHeader("Content-Disposition", `attachment; filename="${resource.assets[0].fileName}"`);

      // Stream the file to the response
      response.data.pipe(res);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Error fetching asset" });
    }
  } else {
    res.status(403);
    throw new Error("You are not authorized to download this resource");
  }
});

const getUserDownloads = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const alldownloadresource = await DownloadRecordSchema.find({ user: userId }).sort("-createdAt").populate("resource");

  if (!alldownloadresource) {
    res.status(500);
    throw new Error("Something went wrong");
  }
  const downloadData = {
    totalResourcesDownload: alldownloadresource.length,
    totalPremiumResourcesDownload: alldownloadresource.filter((resource) => resource.type === "premium").length,
    totalFreeResourcesDownload: alldownloadresource.filter((resource) => resource.type === "free").length,
    data: alldownloadresource,
  };

  res.status(200).json(downloadData);
});

/* ------------- Admin  Routes --------------*/
const downloadgetAllResourcebyAdmin = asyncHandler(async (req, res) => {
  const alldownloadresource = await DownloadRecordSchema.find({}).sort("-createdAt").populate("resource").populate("user");
  res.status(200).json(alldownloadresource);
});

module.exports = { downloadResource, getUserDownloads, downloadgetAllResourcebyAdmin };
