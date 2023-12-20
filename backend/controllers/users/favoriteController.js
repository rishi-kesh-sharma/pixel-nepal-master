const asyncHandler = require("express-async-handler");
const User = require("../../models/user/userModel");
const Favorite = require("../../models/user/favoriteModel");
const ResourceSchema = require("../../models/resource/resourceSchema");
const { isValidObjectId } = require("mongoose");

const toggleFavorite = asyncHandler(async (req, res) => {
  const resourceId = req.body.resourceId;
  let status = "added";

  if (!isValidObjectId(resourceId)) return res.status(422).json({ error: "resource id is invalid!" });

  const resource = await ResourceSchema.findById(resourceId);
  if (!resource) return res.status(404).json({ error: "Resources not found!" });

  // resource is already in fav
  const alreadyExists = await Favorite.findOne({
    owner: req.user.id,
    items: resourceId,
  });

  if (alreadyExists) {
    // we want to remove from old lists
    await Favorite.updateOne(
      { owner: req.user.id },
      {
        $pull: { items: resourceId },
      }
    );

    status = "removed";
  } else {
    const favorite = await Favorite.findOne({ owner: req.user.id });
    if (favorite) {
      // trying to add new resource to the old list
      await Favorite.updateOne(
        { owner: req.user.id },
        {
          $addToSet: { items: resourceId },
        }
      );
    } else {
      // trying to create fresh fav list
      await Favorite.create({ owner: req.user.id, items: [resourceId] });
    }
  }

  if (status === "added") {
    await ResourceSchema.findByIdAndUpdate(resourceId, {
      $addToSet: { likes: req.user.id },
    });
  }

  if (status === "removed") {
    await ResourceSchema.findByIdAndUpdate(resourceId, {
      $pull: { likes: req.user.id },
    });
  }

  res.json({ status });
});

const getFavoriteLists = asyncHandler(async (req, res) => {
  const favoriteLists = await Favorite.find({ owner: req.user.id }).populate("items");

  if (!favoriteLists || favoriteLists.length === 0) {
    return res.json([]);
  }

  res.json(favoriteLists);
});
module.exports = {
  toggleFavorite,
  getFavoriteLists,
};
