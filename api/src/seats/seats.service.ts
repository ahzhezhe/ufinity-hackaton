import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';
import { SeatMetadata } from './entities/seat-metadata.entity';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private seatsRepository: Repository<Seat>,
    @InjectRepository(SeatMetadata)
    private metadataRepository: Repository<SeatMetadata>,
  ) {}

  async findAll(isBlocked?: boolean) {
    const query = this.seatsRepository.createQueryBuilder('seat');
    if (isBlocked !== undefined) {
      query.where('seat.isBlocked = :isBlocked', { isBlocked });
    }
    return query.getMany();
  }

  async findOne(id: number) {
    const seat = await this.seatsRepository.findOneBy({ id });
    if (!seat) {
      throw new NotFoundException(`Seat #${id} not found`);
    }

    const metadata = await this.metadataRepository.find({
      where: { seatId: id },
    });

    return {
      ...seat,
      metadata: metadata.reduce(
        (acc, m) => {
          acc[m.metaKey] = m.metaValue;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  }

  async create(createSeatDto: {
    name: string;
    type?: string;
    metadata?: Record<string, string>;
  }) {
    const seat = this.seatsRepository.create({
      name: createSeatDto.name,
      type: createSeatDto.type || 'regular',
    });

    const savedSeat = await this.seatsRepository.save(seat);

    if (createSeatDto.metadata) {
      const metadataEntities = Object.entries(createSeatDto.metadata).map(([key, value]) =>
        this.metadataRepository.create({
          seatId: savedSeat.id,
          metaKey: key,
          metaValue: value,
        }),
      );
      await this.metadataRepository.save(metadataEntities);
    }

    return this.findOne(savedSeat.id);
  }

  async update(
    id: number,
    updateSeatDto: { name?: string; type?: string; isBlocked?: boolean },
  ) {
    const seat = await this.seatsRepository.findOneBy({ id });
    if (!seat) {
      throw new NotFoundException(`Seat #${id} not found`);
    }

    Object.assign(seat, updateSeatDto);
    await this.seatsRepository.save(seat);

    return this.findOne(id);
  }

  async remove(id: number) {
    const seat = await this.seatsRepository.findOneBy({ id });
    if (!seat) {
      throw new NotFoundException(`Seat #${id} not found`);
    }

    await this.seatsRepository.remove(seat);
    return { message: 'Seat deleted successfully' };
  }
}
