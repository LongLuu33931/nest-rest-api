import { MyJwtGuard } from '../auth/guard';
import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { GetUser } from '../auth/decorator';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';
@UseGuards(MyJwtGuard)
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}
  @Get()
  getNotes(@GetUser('id') userId: number) {
    return this.noteService.getNotes(userId);
  }
  @Get(':id')
  getNoteById(@Param('id') noteId: number) {
    return this.noteService.getNoteById(noteId);
  }
  @Post()
  insertNote(
    @GetUser('id') userId: number,
    @Body() insertNoteDTO: InsertNoteDTO,
  ) {
    console.log(
      `userid : ${userId} insert data : ${JSON.stringify(insertNoteDTO)}`,
    );
    return this.noteService.insertNote(userId, insertNoteDTO);
  }
  @Patch(':id')
  updateNote(
    @Param('id', ParseIntPipe) noteId: number,
    @Body() updateNoteDTO: UpdateNoteDTO,
  ) {
    return this.noteService.updateNote(noteId, updateNoteDTO);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  deleteNoteById(@Query('id', ParseIntPipe) noteId: number) {
    return this.noteService.deleteNoteById(noteId);
  }
}
