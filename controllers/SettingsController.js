const SettingsModel = require('../models/settings');

const getSettings = async (req, res) => {
  try {
    const settings = await SettingsModel.findOne();

    res.status(200).json({ success: true, data: settings, total: settings.length });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.status(400).json({ success: false, message: 'Erroorrrr' });
  }
};

const updateSettings = async (req, res) => {
  const updates = req.body;

  try {
    const updateSettings = await SettingsModel.findOneAndUpdate({}, updates, { new: true, upsert: true });
    if (updateSettings) {
      return res.status(200).json({ success: true, message: 'Update successfully!' });
    }
    return res.status(400).json({ success: false, message: 'Update failed!' });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.status(400).json({ success: false, message: 'Erroorrrr' });
  }
};

module.exports = { getSettings, updateSettings };
