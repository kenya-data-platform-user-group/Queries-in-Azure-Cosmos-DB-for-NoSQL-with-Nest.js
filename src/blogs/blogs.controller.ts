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
  constructor(private readonly blogsService: BlogsService) { }



  // get all blogs
  @Get()
  findAll() {
    return this.blogsService.findAllBlogs();
  }

  // create a blog
  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(createBlogDto);
  }



  // get all blogs with comments
  @Get('with-comments')
  getAllBlogsWithComments() {
    return this.blogsService.getAllBlogsWithComments();
  }

  // create many blogs
  @Post('many')
  createMany(@Body() createBlogDtos: CreateBlogDto[]) {
    return this.blogsService.createManyBlogs(createBlogDtos);
  }

  // create mock blogs
  @Get('mock')
  createMockBlogs() {
    return this.blogsService.createMockBlogs();
  }

  // remove all blogs
  @Delete('all-blogs')
  removeAllBlogs() {
    return this.blogsService.removeAllBlogs();
  }



  // get all comments from a blog
  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDTO,
  ) {
    return this.blogsService.addComment(id, createCommentDto);
  }

  // get a blog via id
  // url: /blogs/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOneBlog(id);
  }

  // update a blog via id
  // url: /blogs/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.updateBlog(id, updateBlogDto);
  }

  // update a comment via id in a blog
  // url: /blogs/:blogId/comments/:commentId
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

  // remove a blog via id
  // url: /blogs/:id
  @Delete(':id')
  removeABlog(@Param('id') id: string) {
    return this.blogsService.removeBlogViaId(id);
  }

  // remove a comment via id in a blog
  // url: /blogs/:blogId/comments/:commentId
  @Delete(':blogId/comments/:commentId')
  removeComment(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.blogsService.removeComment(blogId, commentId);
  }

  // get a comment by id
  // url: /blogs/:blogId/comments/:commentId
  @Get(':blogId/comments/:commentId')
  getCommentById(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.blogsService.getCommentById(blogId, commentId);
  }
}
