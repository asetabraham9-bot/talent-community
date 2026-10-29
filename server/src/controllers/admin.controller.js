import {
  getAdminProfile,
  getPendingOrganizations,
  verifyOrganization,
  rejectOrganization,
  suspendUserAccount,
  reactivateUserAccount,
  getAllOrganizations,
  getAllUsers,
  getAllAuditLogs,
  createNewAuditLog,
  updateAuditLog,
  deleteAuditLog,
} from "../services/admin.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getAdminProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Admin profile retrieved successfully.",
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
};

export const getPendingOrganizationsHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await getPendingOrganizations({
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      message: "Pending organizations retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyOrganizationHandler = async (
  req,
  res,
  next
) => {
  try {
    const organization = await verifyOrganization(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Organization verified successfully.",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};

export const rejectOrganizationHandler = async (
  req,
  res,
  next
) => {
  try {
    const organization = await rejectOrganization(
      req.user.id,
      req.params.id,
      req.body?.reason
    );

    return res.status(200).json({
      success: true,
      message: "Organization rejected successfully.",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};

export const suspendUserAccountHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = await suspendUserAccount(
      req.user.id,
      req.params.id,
      req.body?.reason
    );

    return res.status(200).json({
      success: true,
      message: "User account suspended successfully.",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const reactivateUserAccountHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = await reactivateUserAccount(
      req.user.id,
      req.params.id,
      req.body?.reason
    );

    return res.status(200).json({
      success: true,
      message: "User account reactivated successfully.",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};


export const getAllOrganizationsHandler = async (req, res, next) => {
  try {
    const result = await getAllOrganizations({
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: 'Organizations retrieved successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllUsersHandler = async (req, res, next) => {
  try {
    const result = await getAllUsers({
      page: req.query.page,
      limit: req.query.limit,
      role: req.query.role,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllAuditLogsHandler = async (req, res, next) => {
  try {
    const result = await getAllAuditLogs({
      page: req.query.page,
      limit: req.query.limit,
      resourceType: req.query.resourceType,
      actor: req.query.actor,
    });

    return res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const createAuditLogHandler = async (req, res, next) => {
  try {
    const log = await createNewAuditLog(req.body);

    return res.status(201).json({
      success: true,
      message: 'Audit log created successfully.',
      data: log,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAuditLogHandler = async (req, res, next) => {
  try {
    const log = await updateAuditLog(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Audit log updated successfully.',
      data: log,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAuditLogHandler = async (req, res, next) => {
  try {
    const result = await deleteAuditLog(req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error) {
    return next(error);
  }
};
