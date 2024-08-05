import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import { FinalUssdReq, HBUssdCallBackReq } from "src/models/dto/hubtel/callback-ussd.dto";
import {HbEnums} from "src/models/dto/hubtel/hb-enums";
import {CheckOutItem, HBussdReq, HbUssdResObj} from "src/models/dto/hubtel/hb-ussd.dto";
import {Competitions, Contestants} from "../models/schemas/competition.schema";
import { AppService } from "./app.service";

@Injectable()
export class UssdService {
  private excludedFields = ['__v'];
  constructor(
      @InjectModel(Competitions.name) private readonly competitionModel: Model<Competitions>,
      @InjectModel(Contestants.name) private readonly contestantsModel: Model<Contestants>,
      private readonly appService: AppService
  ){}

  private sMap = new Map<string, any>();

  async hbUssdCall(req: HBussdReq) {
    try {
      switch (req.Type.toLowerCase()) {
        case HbEnums.INITIATION:
          console.log("Handling initiation event");
          return await this.sendInitialUssdCallResponse(req);
        case HbEnums.RESPONSE:
          console.log("Handling response event");
          return await this.sendUssdCallSequenceResponse(req);
        case HbEnums.TIMEOUTS:
          console.log("Handling timeout event");
          return await this.sendReleaseUssdCallResponse(req.SessionId);
        case HbEnums.RELEASE:
          console.log("Handling release event");
          return await this.sendReleaseUssdCallResponse(req.SessionId);
        // case HbEnums.ADDTOCART:
        //   console.log("Handling checkout event");
        //   return await this.sendCheckOutUssdCallResponse(req);
        default:
          console.log("Unknown event");
          return await this.sendReleaseUssdCallResponse(req.SessionId);
      }
    }catch (error) {
      new Error("Method not implemented.");
    }
  }

  async ussdCallback(req: HBUssdCallBackReq) {
    let finalResponse = new FinalUssdReq();
    finalResponse.SessionId = req.SessionId;
    finalResponse.OrderId = req.OrderId;
    finalResponse.MetaData = null;
    if (req.OrderInfo.Payment.IsSuccessful === true) {
      finalResponse.ServiceStatus = "success";
    }else {
      finalResponse.ServiceStatus = "failed";
    }
  }

  async sendInitialUssdCallResponse(req: HBussdReq) {
    let resp = new HbUssdResObj();
    resp.SessionId = req.SessionId;
    resp.Type = HbEnums.RESPONSE;
    resp.Label = 'Welcome page';
    resp.Message = 'Welcome to my votehub.\nEnter nominee code';
    resp.DataType = HbEnums.DATATYPE_INPUT;
    resp.FieldType = HbEnums.FIELDTYPE_TEXT;
    return JSON.stringify(resp);
  }

  async sendUssdCallSequenceResponse(req: HBussdReq) {
    let resp = new HbUssdResObj();
    if (req.Sequence === 2) {
      const contestantInfo = await this.appService.findContestantByShortCode(req.Message);
      const contestantObj = (contestantInfo.toObject() as Contestants);
      resp.SessionId = req.SessionId;
      resp.Type = HbEnums.RESPONSE;
      resp.Label = 'Number of votes';
      resp.Message = `How many votes do you want to purchase for ${contestantObj.name}`;
      resp.DataType = HbEnums.DATATYPE_INPUT;
      resp.FieldType = HbEnums.FIELDTYPE_NUMBER;

      this.sMap.set(req.SessionId, contestantObj.name);
    }else if (req.Sequence === 3) {
      resp.SessionId = req.SessionId;
      resp.Type = HbEnums.RESPONSE;
      resp.Label = 'Confirm votes';
      resp.Message = `Are you sure you want buy ${req.Message} vote(s) for ${this.sMap.get(req.SessionId)}\n
      1-Yes\n2-No`;
      resp.DataType = HbEnums.DATATYPE_INPUT;
      resp.FieldType = HbEnums.FIELDTYPE_NUMBER;
      this.sMap.set(req.SessionId, req.Message);
    }else if (req.Sequence === 4) {
      if (req.Message === '1') {
        resp.SessionId = req.SessionId;
        resp.Type = HbEnums.RESPONSE;
        resp.Label = 'Amount';
        resp.Message = 'Enter amount to purchase?';
        resp.DataType = HbEnums.DATATYPE_INPUT;
        resp.FieldType = HbEnums.FIELDTYPE_DECIMAL;
      }else {
        this.sendReleaseUssdCallResponse(req.SessionId);
      }
    }else if (req.Sequence === 5) {
      this.sendCheckOutUssdCallResponse(req);
    }
    else {
      this.sendReleaseUssdCallResponse(req.SessionId);
    }
    return JSON.stringify(resp)
  }

  async sendCheckOutUssdCallResponse(req: HBussdReq) {
    const resp = new HbUssdResObj();
    resp.SessionId = req.SessionId;
    resp.Type = HbEnums.ADDTOCART;
    resp.Label = 'The request has been submitted. Please wait for a payment prompt soon';
    resp.Message = 'The request has been submitted. Please wait for a payment prompt soon';
    resp.DataType = HbEnums.DATATYPE_DISPLAY;
    resp.FieldType = HbEnums.FIELDTYPE_TEXT;
    resp.Item = new CheckOutItem(HbEnums.ITEM_SEND_MONEY, this.sMap.get(req.SessionId), req.Message);
    return JSON.stringify(resp);
  }

  async sendReleaseUssdCallResponse(sessionId: string) {
    const resp = new HbUssdResObj();
    resp.SessionId = sessionId;
    resp.Type = HbEnums.RELEASE;
    resp.Label = 'See you again';
    resp.Message = 'Thank you for your time';
    resp.DataType = HbEnums.DATATYPE_DISPLAY;
    resp.FieldType = HbEnums.FIELDTYPE_TEXT;
    const ds= await this.sMap.delete(sessionId);
    console.log(`ENDING USSD PROCESSING FOR SESSION ::::: ${ds}`);
  }
}
