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
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateCommentDTO,
  UpdateCommentDto,
} from './dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get('comments-in-blogs')
  getAllCommentsInBlogs() {
    return this.blogsService.getAllCommentsInBlogs();
  }
  @Get('with-comments')
  getAllBlogsWithComments() {
    return this.blogsService.getAllBlogsWithComments();
  } 

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(createBlogDto);
  }

  @Post('many')
  createMany(@Body() createBlogDtos: CreateBlogDto[]) {
    return this.blogsService.createManyBlogs(createBlogDtos);
  }

  @Get('/mock')
  createMockBlogs() {
    return this.blogsService.createMockBlogs();
  }

  @Get()
  findAll() {
    return this.blogsService.findAllBlogs();
  }

  @Delete('all-blogs')
  removeAllBlogs() {
    return this.blogsService.removeAllBlogs();
  }

  @Get('comments/:id')
  getCommentById(@Param('id') id: string) {
    return this.blogsService.getCommentById(id);
  }

  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDTO,
  ) {
    return this.blogsService.addComment(id, createCommentDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOneBlog(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.updateBlog(id, updateBlogDto);
  }

  @Patch(':blogId/comments/:commentId')
  updateComment(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.blogsService.updateComment(
      blogId,
      commentId,
      updateCommentDto.content,
    );
  }

  @Delete(':id')
  removeABlog(@Param('id') id: string) {
    return this.blogsService.removeBlogViaId(id);
  }

  @Delete(':blogId/comments/:commentId')
  removeComment(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.blogsService.removeComment(blogId, commentId);
  }
}
