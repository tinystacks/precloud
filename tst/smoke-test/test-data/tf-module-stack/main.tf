module "my_vpc" {
  source = "git::https://github.com/tinystacks/tinystacks-terraform-modules.git//aws/modules/vpc"

  ts_aws_vpc_cidr_block   = "10.0.0.0/16"
  ts_aws_vpc_cidr_newbits = 4

  ts_vpc_slice_azs             = true
  ts_vpc_slice_azs_start_index = 0
  ts_vpc_slice_azs_end_index   = 2
}