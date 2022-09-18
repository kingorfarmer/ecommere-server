const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync')

const apiFeatures = async (queryValue) => {
  const queryObj = { ...queryValue };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((element) => {
    delete queryObj[element];
  });

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (value) => `$${value}`);

  let query = Tour.find(JSON.parse(queryStr));

  if (queryValue.sort) {
    const sortBy = queryValue.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (queryValue.fields) {
    const fields = queryValue.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  if (queryValue.page && queryValue.limit) {
    const totalTours = await Tour.countDocuments();
    const page = +queryValue.page;
    const limit = +queryValue.limit;
    const skip = (page - 1) * limit;

    if (skip >= totalTours) {
      return res.status(404).json({
        status: 'error',
        message: 'This page does not exist',
      });
    }

    query = query.skip(skip).limit(limit);
  }

  return query;
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'error',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.topFiveCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(
  async (req, res, next) => {
    const query = apiFeatures(req.query);
    const tours = await query;

    res.status(201).json({
      status: 'success',
      total: tours.length,
      data: {
        tours,
      },
    });
  }
)
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
    res.status(404).json({
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
    res.status(404).json({
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
    res.status(404).json({
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
    res.status(404).json({
      status: 'error',
      message: error,
    });
  }
};

exports.checkId = (req, res, next, val) => {
  console.log(`Tour id: ${val}`);
  next();
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    console.log(stats);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error,
    });
  }
};
