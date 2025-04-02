import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateBlogDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsUUID()
    authorId: string;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsArray()
    @IsOptional()
    tags?: string[];
}
