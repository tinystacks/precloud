resource "aws_vpc" "ts_aws_vpc" {
  cidr_block           = var.ts_aws_vpc_cidr_block
  instance_tenancy     = "default"
  enable_dns_hostnames = true
}

/* */

resource "aws_subnet" "ts_aws_subnet_public_igw" {

  vpc_id            = aws_vpc.ts_aws_vpc.id
  cidr_block        = cidrsubnet(aws_vpc.ts_aws_vpc.cidr_block, var.ts_aws_vpc_cidr_newbits, 1)

  map_public_ip_on_launch = true

}

resource "aws_route_table" "ts_aws_route_table_public_igw" {
  
  vpc_id = aws_vpc.ts_aws_vpc.id

}

resource "aws_route_table_association" "ts_aws_route_table_association_public_igw" {
  
  subnet_id      = aws_subnet.ts_aws_subnet_public_igw.id
  route_table_id = aws_route_table.ts_aws_route_table_public_igw.id

}

resource "aws_internet_gateway" "ts_aws_internet_gateway" {

  vpc_id = aws_vpc.ts_aws_vpc.id

}

resource "aws_route" "ts_aws_route_public_igw" {

  route_table_id         = aws_route_table.ts_aws_route_table_public_igw.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.ts_aws_internet_gateway.id

}


/* */

resource "aws_subnet" "ts_aws_subnet_private_isolated" {

  vpc_id            = aws_vpc.ts_aws_vpc.id
  cidr_block        = cidrsubnet(aws_vpc.ts_aws_vpc.cidr_block, var.ts_aws_vpc_cidr_newbits, 3)
  
}

resource "aws_route_table" "ts_aws_route_table_private_isolated" {

  vpc_id = aws_vpc.ts_aws_vpc.id

}

resource "aws_route_table_association" "ts_aws_route_table_association_private_isolated" {

  subnet_id      = aws_subnet.ts_aws_subnet_private_isolated.id
  route_table_id = aws_route_table.ts_aws_route_table_private_isolated.id
  
}