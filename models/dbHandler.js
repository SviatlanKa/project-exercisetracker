const mongoose = require('mongoose');
const Users = require('./users.js');
const Exercises = require('./exercises.js');

exports.addNewUser = (username, done) => {
    Users.find({ username: username }, (err, data) => {
        if (err) return done(err);
        if (data.length > 0) return done('Username already exists');

        const user = new Users({
            username: username
        });

        user.save((err, data) => {
            if (err) return done(err);
            return done(null, data._id);
        });
    });
}

exports.getAllUsers = (done) => {
    Users.find({}, (err, data) => {
        if (err) return done(err);
        if (data.length == 0) return done('Database is empty');
        return done(null, data);
    });
}

exports.addNewExercise = (req, done) => {
    let { userId, description, duration, date } = req.body;

    if (!date) date = new Date();
    date = new Date(date).toDateString();
    // date = createAndConvertDate();

    Users.findById(userId, (err, user) => {
        if (err && !user) return done("There is no such user");
        if (err) return done(err);

        let exercise = {
            description,
            duration: +duration,
            date,
            username: user.username,
            userId
        }
        console.log(exercise)
        const exerciseToAdd = new Exercises(exercise);

        exerciseToAdd.save((err, data) => {
            if (err) return done(err);
            delete exercise.userId;
            exercise._id = userId;
            return done(null, exercise);
        })
    });
}

exports.getAllUserInfo = (req, done) => {
    const { userId, from, to, limit } = req.query;

    Users.findById(userId, (err, user) => {
        if (err) return done(err);
        if (!user) return done("There is no such user");

        Exercises.find( { userId: userId }, '-_id description duration date', (err, exercises) => {
            if (err) return done(err);
            if (exercises.length == 0) return done("This user doesn't have any exercises");

            if (from) exercises = exercises.filter(ex => new Date(ex.date) > new Date(from));

            if (to) exercises = exercises.filter(ex => new Date(ex.date) < new Date(to));

            if (limit) exercises.splice(-1, exercises.length - +limit);

            const response = {
                _id: userId,
                username: user.username,
                from: from ? new Date(from) : undefined,
                to: to ? new Date(to) : undefined,
                count: exercises.length,
                log:
                    exercises.map(ex => ({
                        description: ex.description,
                        duration: ex.duration,
                        date: ex.date.toDateString()
                    }))
            };
            return done(null, response);
        });
    });
}