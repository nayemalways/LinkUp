/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Query, Types } from 'mongoose';
import { excludeField } from '../modules/events/event.constant';
import { ICoord } from '../modules/users/user.interface';

export class QueryBuilder<T> {
  public queryModel: Query<T[], T>;
  public query: Record<string, string>;

  constructor(queryModel: Query<T[], T>, query: Record<string, string>) {
    this.queryModel = queryModel;
    this.query = query;
  }

  // CASE SENSITIVE FILTERING
  filter(): this {
    const filter = { ...this.query };
    for (const value of excludeField) {
      delete filter[value];
    }

    this.queryModel = this.queryModel.find(filter);
    return this;
  }

  // FILTER BY DATE RANGE
  dateFilter(): this {
    const days = Number(this.query.dateRange);
    if (!days || isNaN(days)) return this;

    const now = new Date();

    this.queryModel = this.queryModel.find({
      event_start: {
        $gte: now,
        $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    });

    return this;
  }

  // TEXT BASED SEARCH ON - title, description, venue
  textSearch(): this {
    const searchTerm = this.query.searchTerm;
    if (!searchTerm) return this;

    this.queryModel = this.queryModel
      .find(
        { $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } } // relevance score
      )
      .sort({ score: { $meta: 'textScore' } });

    return this;
  }

  // FIELD FILTERING
  select(): this {
    const fields = this.query.fields?.split(',').join(' ') || ''; // ex: "title description price" or "title,description,price"
    this.queryModel = this.queryModel.select(fields);
    return this;
  }

  // EVENTS BY CATEGORY
  category(): this {
    const categoryId = this.query.category;
    if (!categoryId) {
      return this;
    }

    this.queryModel = this.queryModel.find({ category: categoryId });

    this.queryModel = this.queryModel.sort({ boosted: -1 });

    return this;
  }

  // NEARBY EVENT QUERY
  nearby(userCurrentPosition: ICoord): this {
    if (
      !userCurrentPosition ||
      userCurrentPosition.lat == null ||
      userCurrentPosition.long == null
    ) {
      return this;
    }

    const maxDistance = Number(this.query.nearby); // meters

    if (!maxDistance || maxDistance <= 0) {
      return this;
    }

    // Use $nearSphere inside find() condition
    const nearbyCondition = {
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [userCurrentPosition.long, userCurrentPosition.lat],
          },
          $maxDistance: maxDistance,
        },
      },
    };

    this.queryModel = this.queryModel.find(nearbyCondition);

    return this;
  }

  // GET EVENTS BY USER INTERESTS
  interests(interests: Types.ObjectId[]): this {
    this.queryModel = this.queryModel.find({
      category: { $in: interests },
    });
    return this;
  }

  // SORTING
  sort(): this {
    const sort = this.query.sort || '-createdAt'; // ex: title, or -title
    this.queryModel = this.queryModel.sort(sort);
    return this;
  }

  // PAGINATION
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.queryModel = this.queryModel.skip(skip).limit(limit);
    return this;
  }

  // JOIN COLLECTION DYNAMICALLY WITH WHITELIST & SCHEMA REF VALIDATION
  join(allowedFields?: string[]): this {
    const joinQuery = this.query?.join;

    if (!joinQuery || typeof joinQuery !== 'string') {
      return this;
    }

    const schema = (this.queryModel as any)?.schema;
    const schemaRefPaths: string[] = schema?.paths
      ? Object.keys(schema.paths).filter((p) => {
          const pathObj = schema.paths[p];
          return Boolean(
            pathObj?.options?.ref || pathObj?.caster?.options?.ref
          );
        })
      : [];

    const requestedRefs = joinQuery
      .split(',')
      .map((ref) => ref.trim())
      .filter(Boolean);

    requestedRefs.forEach((ref) => {
      // Must be a valid identifier (prevents prototype pollution and path traversal)
      if (!/^[a-zA-Z0-9_]+$/.test(ref)) {
        return;
      }

      // If developer explicitly provided allowedFields, ref must be in allowedFields
      if (allowedFields && !allowedFields.includes(ref)) {
        return;
      }

      // If schema exists and has ref paths defined, ref must be a valid reference path
      if (schemaRefPaths.length > 0 && !schemaRefPaths.includes(ref)) {
        return;
      }

      this.queryModel = this.queryModel.populate({ path: ref });
    });

    return this;
  }

  // FINALLY BUILD THE INSTANCE
  build() {
    return this.queryModel;
  }

  // Generate meta data
  async getMeta() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalDocuments = await this.queryModel.model.countDocuments();
    const totalPage = Math.ceil(totalDocuments / limit);

    return {
      page,
      limit,
      total: totalDocuments,
      totalPage,
    };
  }
}
