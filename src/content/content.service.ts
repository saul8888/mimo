import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { db } from "../config/app";
import { Model } from 'mongoose';
import slugify from 'slugify';
import { NewContent } from "./dto/newContent";
import { UpdateContent } from "./dto/updateContent";
import { IContent } from './content.schema';
import { IChapter, Chapter } from 'src/chapter/chapter.schema';
import { CatchId } from './dto/catchId';

@Injectable()
export class ContentService {
    private logger = new Logger('ChapterService');
    constructor(
        @InjectModel(db.collContent)
        private contentModel: Model<IContent>,

        @InjectModel(db.collChapter)
        private chapterModel: Model<IChapter>,
    ) { }

    async newContent(
        contentDto: NewContent,
    ): Promise<IContent> {
        const chapter = await this.chapterModel.findById(contentDto.chapterId)
        if (!chapter) {
            this.logger.verbose(`chapter dont exist`);
            throw new NotImplementedException(`chapter dont exist`);
        }
        try {
            contentDto.slug = chapter.slug + "/" + slugify(contentDto.name, { lower: true })
            const content = await new this.contentModel(contentDto)
            chapter.contentId = chapter.contentId.concat(content._id)
            await chapter.save()
            await content.save()
            return content
        } catch (error) {
            this.logger.verbose(`dont create content`);
            throw new NotImplementedException(error);
        }
    }

    async getTotalContent(
    ): Promise<IContent[]> {
        return this.contentModel.find()
    }

    async getContentOfChapter(
        contentId: CatchId,
    ): Promise<IContent[]> {
        const { id } = contentId
        let iContent = []
        const chapter = await this.chapterModel.findById(id)
        for (let index = 0; index < chapter.contentId.length; index++) {
            let getCourse = await this.contentModel.findById(chapter.contentId[index]).populate('contentId', 'name video file')
            await iContent.push(getCourse)
        }

        return iContent
    }

    async getContent(
        contentId: CatchId,
    ): Promise<IContent> {
        const { id } = contentId
        const content = await this.contentModel.findById(id)
        return content
    }

    async updateContent(
        contentId: CatchId,
        contentDto: UpdateContent,
    ): Promise<IContent> {
        const { id } = contentId
        try {
            const content = await this.contentModel.findById(id)
            content.name = contentDto.name
            const slug1 = (content.slug).split('/');
            content.slug = slug1[0] + "/" + slug1[1] + "/" + slugify(contentDto.name, { lower: true })
            content.updateAt = new Date()
            return content.save()
        } catch (error) {
            this.logger.verbose(`cant update content`);
            throw new NotImplementedException(error);
        }
    }

    async deleteContent(
        id: string,
    ): Promise<IContent> {
        try {
            const chapter = await this.contentModel.findById(id)

            if (!chapter) {
                this.logger.verbose(`user with ID "${id}" cant delete`);
                throw new NotImplementedException(`user with ID "${id}" cant delete`);
            }
            await this.contentModel.deleteOne({ _id: id });
            return chapter;
        } catch (error) {
            this.logger.verbose(`cant delete chapter`);
            throw new NotImplementedException(error);
        }
    }

    async removeContent(
        id: string,
    ): Promise<IContent> {
        const chapter = await this.contentModel.findById(id)
        try {
            await chapter.remove()
            return chapter
        } catch (error) {
            this.logger.verbose(`cant delete chapter`);
            throw new NotImplementedException(error);
        }
    }

}
