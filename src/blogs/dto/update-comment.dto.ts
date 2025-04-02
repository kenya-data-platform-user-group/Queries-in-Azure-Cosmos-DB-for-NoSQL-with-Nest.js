import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDTO } from './create-comment.dto';
import { IsString } from 'class-validator';

export class UpdateCommentDto extends PartialType(CreateCommentDTO) {
    @IsString()
    content: string;  //content compulsory
}
