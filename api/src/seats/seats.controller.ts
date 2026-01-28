import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('blocked') blocked?: string) {
    const filterBlocked = blocked === 'true' ? true : blocked === 'false' ? false : undefined;
    return this.seatsService.findAll(filterBlocked);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.seatsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createSeatDto: { name: string; type?: string; metadata?: Record<string, string> },
  ) {
    return this.seatsService.create(createSeatDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSeatDto: { name?: string; type?: string; isBlocked?: boolean },
  ) {
    return this.seatsService.update(+id, updateSeatDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.seatsService.remove(+id);
  }
}
