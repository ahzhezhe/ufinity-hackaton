import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { FloorPlansService } from './floor-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('floor-plans')
export class FloorPlansController {
  constructor(private readonly floorPlansService: FloorPlansService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.floorPlansService.findAll();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  getActive() {
    return this.floorPlansService.getActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.floorPlansService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFloorPlanDto: { name: string; imagePath: string; uploadedBy: number }) {
    return this.floorPlansService.create(createFloorPlanDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateFloorPlanDto: { name?: string; imagePath?: string; isActive?: boolean },
  ) {
    return this.floorPlansService.update(+id, updateFloorPlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.floorPlansService.remove(+id);
  }
}
