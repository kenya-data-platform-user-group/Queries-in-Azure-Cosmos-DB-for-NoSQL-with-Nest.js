import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto, CreateCommentDTO, UpdateCommentDto } from './dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) { }

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(createBlogDto);
  }
  // @Post(':id/comments')
  // createComment(
  //   @Param('id') id: string,
  //   @Body() createCommentDto: CreateCommentDTO,
  // ) {
  //   return this.blogsService.createComment(id, createCommentDto);
  // }

  @Get('/mock')
  createMockBlogs() {
    return this.blogsService.createMockBlogs();
  }

  @Get()
  findAll() {
    return this.blogsService.findAllBlogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOneBlog(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.updateBlog(id, updateBlogDto);
  }

  @Delete(':id')
  removeABlog(@Param('id') id: string) {
    return this.blogsService.removeBlogViaId(id);
  }

  @Delete('all-blogs')
  removeAllBlogs() {
    return this.blogsService.removeAllBlogs();
  }
}
