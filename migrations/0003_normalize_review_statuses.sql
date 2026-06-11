UPDATE reports
SET status = CASE
  WHEN status IN ('处理中', '已反馈') THEN '审核通过'
  WHEN status IN ('已驳回', '驳回') THEN '驳回'
  ELSE '审核中'
END;
