import { pipeline } from 'stream/promises';

import { catchAsync } from '../lib/catchAsync';
import { HttpException } from '../lib/httpException';
import { HttpStatus } from '../lib/httpStatus';
import { PaginatedResponseDto, type PaginateParams } from '../lib/paginate';
import { FILE_ID_PARAM, FileIdParam } from './dto/fileIdParam.dto';
import { FileInfoDto } from './dto/fileInfo.dto';
import { filesService } from './files.service';

export function getFilesController() {
    const upload = catchAsync(async (req, res) => {
        const file = req.file;
        const ownerId = req.userId as string;

        if (!file) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                'File not provided'
            );
        }

        const fileInfo = await filesService.uploadFile(file, ownerId);
        res.status(HttpStatus.CREATED).send(FileInfoDto.parse(fileInfo));
    });

    const getUserFiles = catchAsync(async (req, res) => {
        const paginationParams = req.query as unknown as PaginateParams;
        const list_size = Number(paginationParams.list_size) || 1;
        const page = Number(paginationParams.page) || 1;
        const userId = req.userId as string;

        const files = await filesService.getUserFiles(userId, page, list_size);

        res.json(PaginatedResponseDto('files', FileInfoDto).parse(files));
    });

    const getFileInfo = catchAsync(async (req, res) => {
        const params = req.params as unknown as FileIdParam;
        const fileId = params[FILE_ID_PARAM] as string;
        const ownerId = req.userId as string;

        const fileInfo = await filesService.getFileInfo(fileId, ownerId);

        if (!fileInfo) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `File with ${fileId} not found`
            );
        }

        res.json(FileInfoDto.parse(fileInfo));
    });

    const deleteFile = catchAsync(async (req, res) => {
        const params = req.params as unknown as FileIdParam;
        const fileId = params[FILE_ID_PARAM] as string;
        const ownerId = req.userId as string;

        const fileInfo = await filesService.deleteFile(fileId, ownerId);

        if (!fileInfo) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `File with ${fileId} not found`
            );
        }

        res.status(HttpStatus.NO_CONTENT).send();
    });

    const downloadFile = catchAsync(async (req, res) => {
        const params = req.params as unknown as FileIdParam;
        const fileId = params[FILE_ID_PARAM] as string;
        const ownerId = req.userId as string;

        const file = await filesService.getFileById(fileId, ownerId);

        if (!file) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `File with ${fileId} not found`
            );
        }

        await pipeline(file.body.transformToWebStream(), res);
    });

    const updateFile = catchAsync(async (req, res) => {
        const params = req.params as unknown as FileIdParam;
        const fileId = params[FILE_ID_PARAM] as string;
        const ownerId = req.userId as string;

        const fileInfo = await filesService.deleteFile(fileId, ownerId);

        if (!fileInfo) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `File with ${fileId} not found`
            );
        }

        const file = req.file;
        if (!file) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                'File not provided'
            );
        }

        const newFileInfo = await filesService.uploadFile(
            file,
            ownerId,
            fileId
        );

        res.send(FileInfoDto.parse(newFileInfo));
    });

    return {
        deleteFile,
        downloadFile,
        getFileInfo,
        getUserFiles,
        updateFile,
        upload,
    };
}
