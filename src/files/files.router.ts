import { Router } from 'express';
import multer from 'multer';

import { authenticate } from '../auth/middlewares/authenticate.middleware';
import { Env } from '../config';
import { PaginateParamsDto } from '../lib/paginate';
import { validateParams } from '../middlewares/validateParams.middleware';
import { validateQuery } from '../middlewares/validateQuery.middleware';
import { FILE_ID_PARAM, FileIdDto } from './dto/fileIdParam.dto';
import { getFilesController } from './files.controller';

export function getFilesRouter() {
    const router = Router();
    const controller = getFilesController();
    const upload = multer({ limits: { fileSize: Env.FILE_SIZE_LIMIT } });

    router.post(
        '/file/upload',
        authenticate,
        upload.single('file'),
        controller.upload
    );

    router.get(
        '/file/list',
        authenticate,
        validateQuery(PaginateParamsDto),
        controller.getUserFiles
    );

    router.get(
        `/file/:${FILE_ID_PARAM}`,
        authenticate,
        validateParams(FileIdDto),
        controller.getFileInfo
    );

    router.delete(
        `/file/delete/:${FILE_ID_PARAM}`,
        authenticate,
        validateParams(FileIdDto),
        controller.deleteFile
    );

    router.get(
        `/file/download/:${FILE_ID_PARAM}`,
        authenticate,
        validateParams(FileIdDto),
        controller.downloadFile
    );

    router.put(
        `/file/update/:${FILE_ID_PARAM}`,
        authenticate,
        validateParams(FileIdDto),
        upload.single('file'),
        controller.updateFile
    );

    return router;
}
