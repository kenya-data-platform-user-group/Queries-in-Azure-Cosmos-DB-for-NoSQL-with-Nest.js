import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDTO {
    @IsString()
    @IsNotEmpty()
    authorName: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}