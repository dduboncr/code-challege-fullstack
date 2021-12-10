import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const cuboid = await Cuboid.query().findOne({ id: Number(req.params.id) });

  if (!cuboid) {
    res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
  }

  if (cuboid?.height && cuboid?.width && cuboid?.height) {
    cuboid.volume = cuboid?.height * cuboid?.width * cuboid?.height;
  }

  res.json(cuboid);
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const cubeVolume = width * height * depth;

  const bag = await Bag.query().findOne({ id: bagId });

  if (!bag) {
    return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
  }

  if (bag?.availableVolume < cubeVolume) {
    return res.status(422).json({ message: 'Insufficient capacity in bag' });
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });
  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { width, height, depth } = req.body;

  const updatedCuboid = await Cuboid.query().patchAndFetchById(
    Number(req.params.id),
    {
      width,
      height,
      depth,
    }
  );

  const bag = await Bag.query().findOne({ id: updatedCuboid.bagId });

  if (bag) {
    updatedCuboid.bag = bag;
  }

  res.json(updatedCuboid);
};

export const deleteById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const exist = await Cuboid.query().findById(Number(req.params.id));

  console.log({ exist });
  if (!exist) {
    res.status(HttpStatus.NOT_FOUND).json({});
    return;
  }
  await Cuboid.query().deleteById(Number(req.params.id));

  res.json({});
};
