// src/controllers/UserVisitController.js
const UserVisit = require("../models/UserVisit");
const Place = require("../models/Place");
const sequelize = require("../config/database");

class UserVisitController {
  // 1. Toggle Visit (Check/Uncheck) dengan Auto-Import OSM
  async toggleVisitStatus(req, res) {
    const t = await sequelize.transaction(); // Mulai Transaksi

    try {
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const user_id = req.user.id;

      // Ambil data dari Body
      const {
        status,
        place_data, // 👈 1. Kita ambil place_data dari request frontend
        is_osm,
        osm_id,
        name,
        lat,
        lng,
        address,
        category,
      } = req.body;

      let { place_id } = req.body;

      // VALIDASI STATUS
      if (!status) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Status is required" });
      }

      // --- LOGIC A: PENANGANAN KHUSUS OSM ---
      if (is_osm === true || is_osm === "true") {
        // Cek di DB
        let place = await Place.findOne({
          where: { osm_id: String(osm_id) },
          transaction: t,
        });

        // Jika belum ada, BUAT BARU
        if (!place) {
          if (!name || !lat || !lng) {
            await t.rollback();
            return res.status(400).json({ message: "Missing OSM data info" });
          }

          place = await Place.create(
            {
              osm_id: String(osm_id),
              name_en: name,
              category: category || "Restaurant",
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
              address: address || "Nearby Location",
              halal_status: category === "Mosque" ? "Verified" : "No Pork",
              is_verified: true,
              contributor_id: user_id,
            },
            { transaction: t }
          );
        }

        place_id = place.id;
      }

      // --- LOGIC B: PENANGANAN ID DATABASE ---
      if (place_id && String(place_id).startsWith("db-")) {
        place_id = String(place_id).replace("db-", "");
      }

      if (!place_id) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Place ID is required" });
      }

      console.log(
        `👉 Toggling Visit: User ${user_id} -> Place ${place_id} (${status})`
      );

      // --- LOGIC C: TOGGLE STATUS ---
      const existingVisit = await UserVisit.findOne({
        where: { user_id, place_id },
        transaction: t,
      });

      if (existingVisit) {
        // Skenario 1: Data sudah ada
        if (existingVisit.status === status) {
          // Status sama -> HAPUS
          await existingVisit.destroy({ transaction: t });
          await t.commit();
          return res.json({ success: true, message: "Removed from list" });
        } else {
          // Status beda -> UPDATE
          existingVisit.status = status;
          existingVisit.visited_at = new Date();

          // 👇 2. Update snapshot place_data jika ada
          if (place_data) {
            existingVisit.place_data = place_data;
          }

          await existingVisit.save({ transaction: t });
          await t.commit();
          return res.json({ success: true, message: `Updated to ${status}` });
        }
      } else {
        // Skenario 2: Data belum ada -> BUAT BARU
        await UserVisit.create(
          {
            user_id,
            place_id: place_id,
            status,
            visited_at: new Date(),
            place_data: place_data || {}, // 👇 3. Simpan snapshot data disini
          },
          { transaction: t }
        );

        await t.commit();
        return res.json({ success: true, message: `Marked as ${status}` });
      }
    } catch (error) {
      await t.rollback();
      console.error("❌ Error toggle visit:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. Get My Visits
  async getMyVisits(req, res) {
    try {
      if (!req.user || !req.user.id)
        return res.json({ success: true, data: [] });

      const user_id = req.user.id;

      const visits = await UserVisit.findAll({
        where: { user_id },
        // Kita ambil place_data juga sebagai cadangan jika relasi place terhapus
        attributes: ["place_id", "status", "place_data"],
        include: [
          {
            model: Place,
            as: "place",
            attributes: [
              "id",
              "osm_id",
              "name_en",
              "category",
              "image_url",
              "latitude",
              "longitude",
            ],
          },
        ],
      });

      const formattedVisits = {};
      visits.forEach((v) => {
        // Prioritas 1: Ambil ID dari Relasi Place
        if (v.place) {
          formattedVisits[`db-${v.place.id}`] = v.status;
          if (v.place.osm_id) {
            formattedVisits[`osm-${v.place.osm_id}`] = v.status;
          }
        }
        // Prioritas 2: Fallback ke place_id manual (jarang terjadi dgn logic baru)
        else {
          formattedVisits[`db-${v.place_id}`] = v.status;
        }
      });

      res.json({ success: true, data: formattedVisits });
    } catch (error) {
      console.error("❌ Error get visits:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
}

module.exports = new UserVisitController();
