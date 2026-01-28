import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FloorPlan } from './entities/floor-plan.entity';

@Injectable()
export class FloorPlansService {
  constructor(
    @InjectRepository(FloorPlan)
    private floorPlansRepository: Repository<FloorPlan>,
  ) {}

  async findAll() {
    return this.floorPlansRepository.find();
  }

  async findOne(id: number) {
    const floorPlan = await this.floorPlansRepository.findOneBy({ id });
    if (!floorPlan) {
      throw new NotFoundException(`Floor Plan #${id} not found`);
    }
    return floorPlan;
  }

  async getActive() {
    return this.floorPlansRepository.findOneBy({ isActive: true });
  }

  async create(createFloorPlanDto: { name: string; imagePath: string; uploadedBy: number }) {
    const floorPlan = this.floorPlansRepository.create(createFloorPlanDto);
    return this.floorPlansRepository.save(floorPlan);
  }

  async update(
    id: number,
    updateFloorPlanDto: { name?: string; imagePath?: string; isActive?: boolean },
  ) {
    const floorPlan = await this.floorPlansRepository.findOneBy({ id });
    if (!floorPlan) {
      throw new NotFoundException(`Floor Plan #${id} not found`);
    }

    Object.assign(floorPlan, updateFloorPlanDto);
    return this.floorPlansRepository.save(floorPlan);
  }

  async remove(id: number) {
    const floorPlan = await this.floorPlansRepository.findOneBy({ id });
    if (!floorPlan) {
      throw new NotFoundException(`Floor Plan #${id} not found`);
    }

    await this.floorPlansRepository.remove(floorPlan);
    return { message: 'Floor Plan deleted successfully' };
  }
}
