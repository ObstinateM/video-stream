import express from 'express';
import { extname, resolve } from 'path';
import { createReadStream, stat } from 'fs';
import { promisify } from 'util';
import jwt from 'express-jwt';

const app = express();

const allIncludes = (arr, compare) => compare.every(el => arr.includes(el));

const checkTokenAndRank = rank => {
    console.log('PASS');
    return jwt(
        { secret: 'secret', algorithms: ['HS256'], getToken: req => req.query.token },
        (req, res, next) => {
            console.log('ALL RANK ?', req.user.rank, rank, allIncludes(req.user.rank, rank));
            if (!req.user || !allIncludes(req.user.rank, rank)) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            next();
        }
    );
};

const streamVideo = async (req, res) => {
    console.log(req.user);
    const { watch } = req.query;
    const { range } = req.headers;

    if (!watch) {
        return res.status(400).json({ error: 'Missing watch param' });
    }

    if (!watch.match(/^[a-z0-9-_ ]+\.(mp4)$/i)) {
        return res.status(400).json({ error: 'Invalid watch param' });
    }

    if (!range) {
        return res.sendStatus(404);
    }

    const video = resolve('videos', watch);
    const croppedRange = range.replace(/bytes=/, '').split('-');
    const fileStat = await promisify(stat)(video);
    const start = parseInt(croppedRange[0], 10);
    const end = croppedRange[1] ? parseInt(croppedRange[1], 10) : fileStat.size - 1;
    const head = {
        'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1
    };
    res.writeHead(206, head);
    const file = createReadStream(video, { start, end });
    return file.pipe(res);
};

app.get('/api/public/video', streamVideo);

app.get('/api/private/video', checkTokenAndRank(['admin']), streamVideo);

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
