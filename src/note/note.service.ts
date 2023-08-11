import { ForbiddenException, Injectable, ParseIntPipe } from '@nestjs/common';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) {}
  async insertNote(userId: number, insertNoteDTO: InsertNoteDTO) {
    const note = await this.prismaService.note.create({
      data: {
        ...insertNoteDTO,
        userId: userId,
      },
    });
    return note;
  }
  getNotes(userId: number) {
    const notes = this.prismaService.note.findMany({
      where: {
        userId,
      },
    });
    return notes;
  }
  getNoteById(noteId: number) {}
  updateNote(noteId: number, updateNoteDTO: UpdateNoteDTO) {
    const note = this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });
    if (!note) {
      throw new ForbiddenException('Cannot find note to update');
    }
    return this.prismaService.note.update({
      where: {
        id: noteId,
      },
      data: { ...updateNoteDTO },
    });
  }

  deleteNoteById(noteId: number) {
    const note = this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });
    if (!note) {
      throw new ForbiddenException('cannot find note to delete');
    }
    return this.prismaService.note.delete({
      where: { id: noteId },
    });
  }
}
