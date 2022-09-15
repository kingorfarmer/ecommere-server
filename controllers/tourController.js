const Tour = require('./../models/tourModel');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => {
      delete queryObj[element];
    });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (value) => `$${value}`);

    let query = Tour.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 1;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const totalTours = await Tour.countDocuments();
      if (skip >= totalTours) {
        return res.status(400).json({
          status: 'error',
          message: 'This page does not exist',
        });
      }
    }

    const tours = await query;

    res.status(201).json({
      status: 'success',
      total: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(201).json({
      status: 'success',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};
exports.checkId = (req, res, next, val) => {
  console.log(`Tour id: ${val}`);
  next();
};
