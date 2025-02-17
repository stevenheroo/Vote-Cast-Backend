import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {DeleteResult} from "mongodb";
import {CustomPaginator, customResponse} from "../utils/responses";
import {Status} from "../models/schemas/enums/status.enum";
import {Competitions, Contestants} from "../models/schemas/competition.schema";
import {Ids} from "../models/dto/ids";
import {ContestantObj} from "../models/dto/contestant";
import {VoteDto} from "../models/dto/vote.dto";

@Injectable()
export class AppService {

  private excludedFields = ['__v'];
  constructor(
      @InjectModel(Competitions.name) private readonly competitionModel: Model<Competitions>,
      @InjectModel(Contestants.name) private readonly contestantsModel: Model<Contestants>
  ){}
  async createCompetition(userId:string, req: Competitions) {
    let result;
    try{
      req.status = Status.pending;
      req.userId = userId;
      result = await new this.competitionModel(req).save();
    }catch (error) {
      console.log(error);
      return {
        "id": '',
        "response" :new HttpException('FAILED', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
    return {
      "id": result._id,
      "response" :new HttpException('SUCCESS', HttpStatus.CREATED)
    }
  }

  async addContestants(userId:string, req: ContestantObj) {
    let result;
    try{
      for (let i = 0; i < req.contestants.length; i++) {
        req.contestants[i].userId = userId;
      }
      result = await this.contestantsModel.insertMany(req.contestants);
    }catch (error) {
      console.log(error);
      return {
        "id": '',
        "response" :new HttpException('FAILED', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
    return {
      "id": result._id,
      "response" :new HttpException('SUCCESS', HttpStatus.CREATED)
    }
  }

  async findAllCompetitions(page: number, limit: number, status: string) {

    let totalCount : number;
    if(status.toUpperCase() === 'ALL'){
      totalCount = await this.competitionModel.countDocuments();
    }else {
      totalCount = await this.competitionModel.countDocuments({
        'status': status
      });
    }

    const paginator = new CustomPaginator()
    paginator.nextPage = (page * limit) > totalCount ? -1 : 1;
    paginator.requestedPageSize = limit;
    paginator.totalPages = totalCount;

    const excludedFields = ['__v'];

    let results;

    if (status.toUpperCase() === 'ALL') {
      results = await this.competitionModel.find({},
          {
            '_id': 1,
            status: 1,
            competitionName:1,
            description:1,
            organizerName:1,
            image:1,
            endDate: 1
          }
      )
          .sort({ _id: -1 })
          .skip((page - 1) * limit)
          .select({...excludedFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {}) })
          .limit(limit).exec();
    }else {
      results = await this.competitionModel.find({
            'status': status
          },
          {
            '_id': 1,
            status: 1,
            competitionName:1,
            organizerName:1,
            description:1,
            image:1,
            endDate: 1
          }
      )
          .sort({ _id: -1 })
          .skip((page - 1) * limit)
          .select({...excludedFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {}) })
          .limit(limit).exec();
    }


    return {
      "response": results.length === 0
          ? new HttpException(customResponse.empty, HttpStatus.NOT_FOUND)
          : new HttpException(customResponse.success, HttpStatus.OK ),
      "result": results,
      paginator
    };
  }

  async findCompetitionByUser(userId: string, page: number, limit: number, status: string) {
    let totalCount : number;
    if(status === 'all'){
      totalCount = await this.competitionModel.countDocuments({userId});
    }else {
      totalCount = await this.competitionModel.countDocuments({
        'status': status,
        'userId': userId
      });
    }
    const paginator = new CustomPaginator()
    paginator.nextPage = (page * limit) > totalCount ? -1 : 1;
    paginator.requestedPageSize = limit;
    paginator.totalPages = totalCount;

    let results;

    if (status === 'all') {
      results = await this.competitionModel.find({
            'userId':userId
          },
          {
            '_id': 1,
            status: 1,
            competitionName:1,
            organizerName:1,
            description:1,
            image:1,
            endDate: 1
          }
      )
          .sort({ _id: -1 })
          .skip((page - 1) * limit)
          .select({...this.excludedFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {}) })
          .limit(limit).exec();
    }else {
      results = await this.competitionModel.find({
            'status': status,
            'userId': userId
          },
          {
            '_id': 1,
            status: 1,
            competitionName:1,
            organizerName:1,
            description:1,
            image:1,
            endDate: 1
          }
      )
          .sort({ _id: -1 })
          .skip((page - 1) * limit)
          .select({...this.excludedFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {}) })
          .limit(limit).exec();
    }


    return {
      "response": results.length === 0
          ? new HttpException(customResponse.empty, HttpStatus.NOT_FOUND)
          : new HttpException(customResponse.success, HttpStatus.OK ),
      "result": results,
      paginator
    };
  }


  async findCompetitionById(header: any, id: string) {
    try{
      const userId = header.user.jti;
      const role = header.user.sub;

      let result;
      if (role.toLowerCase() === 'user') {
        result = await this.competitionModel.findOne({
          _id: id,
          userId: userId
        }).exec();
      }else {
        result = await this.competitionModel.findOne({
          _id: id,
        }).exec();
      }
      return {
        "response": result != null
            ? new HttpException(customResponse.success, HttpStatus.OK )
            : new HttpException(customResponse.empty, HttpStatus.NO_CONTENT),
        "result": result
      };
    }catch (error) {
      return {
        "response": new HttpException(customResponse.empty, HttpStatus.NO_CONTENT)
      }
    }
  }

  async findContestants(categoryRef: string) {
    try{
      const result = await this.contestantsModel.find({
        categoryRef: categoryRef,
      }).select({...this.excludedFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {}) })
          .exec();

      return {
        "response": result.length > 0
            ? new HttpException(customResponse.success, HttpStatus.OK )
            : new HttpException(customResponse.empty, HttpStatus.NO_CONTENT),
        "result": result
      };
    }catch (error) {
      return {
        "response": new HttpException(customResponse.empty, HttpStatus.NO_CONTENT)
      }
    }
  }

  async findContestantByShortCode(shortCode: string) {
    const result = await this.contestantsModel.findOne({shortCode: shortCode,}, {name: 1}).exec();
    if (!result) {
      return null;
    }
    return result;
  }

  async findContestantById(id: string) {
    try{
      const result = await this.contestantsModel.findOne({
        '_id': id,
      }).select({...this.excludedFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {}) })
          .exec();

      return {
        "response": result != null
            ? new HttpException(customResponse.success, HttpStatus.OK )
            : new HttpException(customResponse.empty, HttpStatus.NO_CONTENT),
        "result": result
      };
    }catch (error) {
      return {
        "response": new HttpException(customResponse.empty, HttpStatus.NO_CONTENT)
      }
    }
  }

  async removeCompetition(header: any, ids: Ids) {
    try{
      const userId = header.user.jti;
      const role = header.user.sub;

      let result: DeleteResult;

      if (role.toLowerCase() === 'user') {
        result = await this.competitionModel.deleteMany({
          '_id': { $in: ids.ids },
          userId: userId
        }).exec();
      }else {
        result = await this.competitionModel.deleteOne({'_id': { $in: ids.ids }}).exec();
      }

      return {
        "response": result.deletedCount != 0
            ? new HttpException(customResponse.success, HttpStatus.OK )
            : new HttpException(customResponse.failed, 400),
        "result": result
      };
    }catch (error) {
      return {
        "response": new HttpException(customResponse.empty, HttpStatus.NO_CONTENT)
      }
    }
  }

  async updateCompetition(userId: string, id: string, req: Competitions) {
    try {
      req.updatedAt = new Date();
      const result = await this.competitionModel.findOneAndUpdate(
          { "_id": id},
          {
            $set: req
          },
          {new: true}
      );
      return {
        "response": result != null ? new HttpException(customResponse.success, HttpStatus.OK)
            : new HttpException(customResponse.failed, 400)
      }
    }catch (error) {
      return {
        "response": new HttpException(customResponse.failed, 400)
      };
    }
  }

  async approvedCompetition(approveId: string, id: string, isApproved: string) {
    try {
      const isApprovedBoolean: boolean = isApproved === 'true';
      const result = await this.competitionModel.findOneAndUpdate(
          { "_id": id},
          {
            "status": isApprovedBoolean ? Status.active : Status.rejected,
            'approvedBy': approveId,
            'approvedAt': new Date()
          },
          {new: true}
      );
      return {
        "response": result != null ? new HttpException(customResponse.success, HttpStatus.OK)
            : new HttpException(customResponse.failed, 400)
      }
    }catch (error) {
      return {
        "response": new HttpException(customResponse.failed, 400)
      };
    }
  }

  async updateCompetitionStatus(userId: string, id: string, status: Status) {
    try {
      const result = await this.competitionModel.findOneAndUpdate(
          { "_id": id},
          {
            'status': status,
            'updatedBy': userId,
            'updatedAt': new Date()
          },
          {new: true}
      );
      return {
        "response": result != null ? new HttpException(customResponse.success, HttpStatus.OK)
            : new HttpException(customResponse.failed, 400)
      }
    }catch (error) {
      return {
        "response": new HttpException(customResponse.failed, 400)
      };
    }
  }

  async findActiveCompetitions(page: number, limit: number) {

    const totalCount = await this.competitionModel.countDocuments({
      'status': Status.active
    });

    const paginator = new CustomPaginator()
    paginator.nextPage = (page * limit) > totalCount ? -1 : 1;
    paginator.requestedPageSize = limit;
    paginator.totalPages = totalCount;

    const excludedFields = ['__v'];

    const results = await this.competitionModel.find({
          'status': Status.active
        },
        {
          '_id': 1,
          status: 1,
          competitionName:1,
          organizerName:1,
          description:1,
          image:1,
          endDate: 1
        }
    )
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .select({...excludedFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {}) })
        .limit(limit).exec();

    return {
      "response": results.length === 0
          ? new HttpException(customResponse.empty, HttpStatus.NOT_FOUND)
          : new HttpException(customResponse.success, HttpStatus.OK ),
      "result": results,
      paginator
    };
  }

  async voteForContestant(req: VoteDto) {
    try {

    }catch (error) {
      console.log(error)
      return {
        "response": new HttpException(customResponse.failed, 400)
      };
    }
  }
}
