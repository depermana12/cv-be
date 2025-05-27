import { LocationRepository } from "../repositories/location.repo";
import { CvChildService } from "./cvChild.service";
import type {
  LocationSelect,
  LocationInsert,
  LocationUpdate,
  LocationQueryOptions,
} from "../db/types/location.type";

export class LocationService extends CvChildService<
  LocationSelect,
  LocationInsert,
  LocationUpdate
> {
  constructor(private readonly locationRepository: LocationRepository) {
    super(locationRepository);
  }

  async createLocation(
    cvId: number,
    locationData: Omit<LocationInsert, "cvId">,
  ): Promise<LocationSelect> {
    return this.createForCv(cvId, { ...locationData, cvId });
  }

  async getLocation(cvId: number, locationId: number): Promise<LocationSelect> {
    return this.findByCvId(cvId, locationId);
  }

  async getAllLocations(
    cvId: number,
    options?: LocationQueryOptions,
  ): Promise<LocationSelect[]> {
    return this.locationRepository.getAllLocations(cvId, options);
  }

  async updateLocation(
    cvId: number,
    locationId: number,
    newLocationData: LocationUpdate,
  ): Promise<LocationSelect> {
    return this.updateForCv(cvId, locationId, newLocationData);
  }

  async deleteLocation(cvId: number, locationId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, locationId);
  }
}
